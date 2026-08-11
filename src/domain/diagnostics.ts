import { projectTree, projectTreeCurves, sampleProjectedCurve } from "./geometry";
import { properIntersection, segmentToSegmentDistance } from "./spatial";
import type { GrowthModule, Point, TreeState } from "./types";

export interface TreeDiagnostics {
  moduleCount: number;
  terminalCount: number;
  maxOrder: number;
  maxChildren: number;
  width: number;
  height: number;
  aspectRatio: number;
  crownCenterX: number;
  leftRightImbalance: number;
  crossings: number;
  belowGroundCount: number;
  invariantErrors: string[];
}

export interface CurvedWoodDiagnostics {
  curveCrossings: number;
  crowdedPairs: number;
  minimumNonLocalClearance: number;
  belowGroundSamples: number;
  taperErrors: number;
  continuationDiameterErrors: number;
  lateralDiameterErrors: number;
}

function childCounts(modules: readonly GrowthModule[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const module of modules) {
    if (module.parentId) {
      counts.set(module.parentId, (counts.get(module.parentId) ?? 0) + 1);
    }
  }
  return counts;
}

function validateHistory(state: TreeState): string[] {
  const errors: string[] = [];
  const byId = new Map<string, GrowthModule>();
  const leafIds = new Set<string>();
  const relationByParent = new Map<string, Set<string>>();
  const sideBranchParents = new Set<string>();

  if (state.schemaVersion !== 3) {
    errors.push(`unsupported schema version ${String(state.schemaVersion)}`);
  }
  if (state.leaves.length !== state.growthIndex) {
    errors.push("growthIndex must equal the number of accepted leaf identities");
  }

  for (const module of state.modules) {
    if (byId.has(module.id)) {
      errors.push(`duplicate module id ${module.id}`);
      continue;
    }
    if (!Number.isFinite(module.restLength) || module.restLength <= 0) {
      errors.push(`invalid rest length for ${module.id}`);
    }
    if (!Number.isFinite(module.restTurn)) {
      errors.push(`invalid rest turn for ${module.id}`);
    }
    if (!Number.isInteger(module.order) || module.order < 0) {
      errors.push(`invalid branch order for ${module.id}`);
    }
    if (!Number.isInteger(module.bornAtEvent) || module.bornAtEvent < 1) {
      errors.push(`invalid birth event for ${module.id}`);
    }

    if (module.parentId === null) {
      if (module.relation !== "origin") {
        errors.push(`root module ${module.id} must have origin relation`);
      }
      if (module.order !== 0) {
        errors.push(`root module ${module.id} must have order 0`);
      }
    } else {
      const parent = byId.get(module.parentId);
      if (!parent) {
        errors.push(`module ${module.id} must reference an earlier parent`);
      } else if (module.relation === "continuation") {
        if (module.axisId !== parent.axisId) {
          errors.push(`continuation ${module.id} must preserve parent axis`);
        }
        if (module.order !== parent.order) {
          errors.push(`continuation ${module.id} must preserve parent order`);
        }
      } else if (module.relation === "lateral") {
        if (module.axisId === parent.axisId) {
          errors.push(`lateral ${module.id} must create a new axis`);
        }
        if (module.order !== parent.order + 1) {
          errors.push(`lateral ${module.id} must increment branch order`);
        }
      } else if (module.relation === "renewal") {
        if (module.axisId === parent.axisId) {
          errors.push(`renewal ${module.id} must create a new axis`);
        }
        if (module.order !== parent.order) {
          errors.push(`renewal ${module.id} must preserve parent order`);
        }
        if (module.order !== 4) {
          errors.push(`renewal ${module.id} must remain in fine order 4`);
        }
        if (module.bornAtEvent <= 1000) {
          errors.push(`renewal ${module.id} cannot predate mature horizon`);
        }
      } else {
        errors.push(`non-root module ${module.id} cannot have origin relation`);
      }

      if (module.relation === "lateral" || module.relation === "renewal") {
        if (sideBranchParents.has(module.parentId)) {
          errors.push(`parent ${module.parentId} has more than one side-branch child`);
        }
        sideBranchParents.add(module.parentId);
      }

      const relations = relationByParent.get(module.parentId) ?? new Set<string>();
      if (relations.has(module.relation)) {
        errors.push(`parent ${module.parentId} has more than one ${module.relation} child`);
      }
      relations.add(module.relation);
      relationByParent.set(module.parentId, relations);
    }
    byId.set(module.id, module);
  }

  for (const leaf of state.leaves) {
    if (leafIds.has(leaf.entryId)) {
      errors.push(`duplicate leaf identity ${leaf.entryId}`);
    }
    leafIds.add(leaf.entryId);
    if (!Number.isInteger(leaf.bornAtEvent) || leaf.bornAtEvent < 1) {
      errors.push(`invalid leaf birth event for ${leaf.entryId}`);
    }

    const host = byId.get(leaf.attachment.moduleId);
    if (!host) {
      errors.push(`leaf ${leaf.entryId} references missing host ${leaf.attachment.moduleId}`);
    } else if (host.bornAtEvent > leaf.bornAtEvent) {
      errors.push(`leaf ${leaf.entryId} attaches to future wood ${host.id}`);
    }
    if (!Number.isFinite(leaf.attachment.position) || leaf.attachment.position < 0 || leaf.attachment.position > 1) {
      errors.push(`invalid attachment position for ${leaf.entryId}`);
    }
    if (leaf.attachment.side !== -1 && leaf.attachment.side !== 1) {
      errors.push(`invalid attachment side for ${leaf.entryId}`);
    }
  }

  const rootCount = state.modules.filter((module) => module.parentId === null).length;
  if (state.modules.length > 0 && rootCount !== 1) {
    errors.push(`expected exactly one structural root, found ${rootCount}`);
  }
  return errors;
}

export function diagnoseTree(state: TreeState): TreeDiagnostics {
  const segments = projectTree(state);
  const counts = childCounts(state.modules);
  const parents = new Set(
    state.modules
      .map((module) => module.parentId)
      .filter((id): id is string => Boolean(id)),
  );
  const terminalCount = state.modules.filter((module) => !parents.has(module.id)).length;

  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;
  let left = 0;
  let right = 0;
  let belowGroundCount = 0;

  for (const segment of segments) {
    minX = Math.min(minX, segment.start.x, segment.end.x);
    maxX = Math.max(maxX, segment.start.x, segment.end.x);
    minY = Math.min(minY, segment.start.y, segment.end.y);
    maxY = Math.max(maxY, segment.start.y, segment.end.y);
    if (segment.end.x < -2) left += 1;
    if (segment.end.x > 2) right += 1;
    if (segment.end.y > 1e-9) belowGroundCount += 1;
  }

  let crossings = 0;
  for (let aIndex = 0; aIndex < segments.length; aIndex += 1) {
    const a = segments[aIndex];
    for (let bIndex = aIndex + 1; bIndex < segments.length; bIndex += 1) {
      const b = segments[bIndex];
      if (
        a.parentId === b.id ||
        b.parentId === a.id ||
        (a.parentId !== null && a.parentId === b.parentId)
      ) {
        continue;
      }
      if (properIntersection(a.start, a.end, b.start, b.end)) crossings += 1;
    }
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const sideCount = left + right;
  return {
    moduleCount: state.modules.length,
    terminalCount,
    maxOrder: state.modules.reduce((max, module) => Math.max(max, module.order), 0),
    maxChildren: Math.max(0, ...counts.values()),
    width,
    height,
    aspectRatio: height > 0 ? width / height : 0,
    crownCenterX: (minX + maxX) / 2,
    leftRightImbalance: sideCount > 0 ? Math.abs(left - right) / sideCount : 0,
    crossings,
    belowGroundCount,
    invariantErrors: validateHistory(state),
  };
}

function polylineCrosses(a: readonly Point[], b: readonly Point[]): boolean {
  for (let ai = 0; ai < a.length - 1; ai += 1) {
    for (let bi = 0; bi < b.length - 1; bi += 1) {
      if (properIntersection(a[ai], a[ai + 1], b[bi], b[bi + 1])) {
        return true;
      }
    }
  }
  return false;
}

function polylineClearance(a: readonly Point[], b: readonly Point[]): number {
  let minimum = Number.POSITIVE_INFINITY;
  for (let ai = 0; ai < a.length - 1; ai += 1) {
    for (let bi = 0; bi < b.length - 1; bi += 1) {
      minimum = Math.min(
        minimum,
        segmentToSegmentDistance(a[ai], a[ai + 1], b[bi], b[bi + 1]),
      );
    }
  }
  return minimum;
}

function isLocalJunction(
  a: { id: string; parentId: string | null },
  b: { id: string; parentId: string | null },
): boolean {
  return (
    a.parentId === b.id ||
    b.parentId === a.id ||
    (a.parentId !== null && a.parentId === b.parentId)
  );
}

export function diagnoseCurvedWood(
  state: TreeState,
  steps = 8,
): CurvedWoodDiagnostics {
  const curves = projectTreeCurves(state);
  const moduleById = new Map(state.modules.map((module) => [module.id, module]));
  const curveById = new Map(curves.map((curve) => [curve.id, curve]));
  const sampled = new Map(
    curves.map((curve) => [curve.id, sampleProjectedCurve(curve, steps)]),
  );

  let curveCrossings = 0;
  let crowdedPairs = 0;
  let minimumNonLocalClearance = Number.POSITIVE_INFINITY;
  let belowGroundSamples = 0;
  let taperErrors = 0;
  let continuationDiameterErrors = 0;
  let lateralDiameterErrors = 0;

  for (const curve of curves) {
    if (curve.endThickness > curve.startThickness + 1e-9) {
      taperErrors += 1;
    }
    for (const point of sampled.get(curve.id) ?? []) {
      if (point.y > 1e-8 && curve.parentId !== null) {
        belowGroundSamples += 1;
      }
    }

    const module = moduleById.get(curve.id);
    const parent = curve.parentId ? curveById.get(curve.parentId) : undefined;
    if (
      module?.relation === "continuation" &&
      parent &&
      Math.abs(curve.startThickness - parent.endThickness) > 1e-9
    ) {
      continuationDiameterErrors += 1;
    }
    if (
      (module?.relation === "lateral" || module?.relation === "renewal") &&
      parent &&
      curve.startThickness >= parent.endThickness - 1e-9
    ) {
      lateralDiameterErrors += 1;
    }
  }

  for (let aIndex = 0; aIndex < curves.length; aIndex += 1) {
    const a = curves[aIndex];
    const aPoints = sampled.get(a.id) ?? [];
    for (let bIndex = aIndex + 1; bIndex < curves.length; bIndex += 1) {
      const b = curves[bIndex];
      if (isLocalJunction(a, b)) continue;

      const bPoints = sampled.get(b.id) ?? [];
      if (polylineCrosses(aPoints, bPoints)) {
        curveCrossings += 1;
      }
      const clearance = polylineClearance(aPoints, bPoints);
      minimumNonLocalClearance = Math.min(minimumNonLocalClearance, clearance);
      if (clearance < 0.65) crowdedPairs += 1;
    }
  }

  return {
    curveCrossings,
    crowdedPairs,
    minimumNonLocalClearance: Number.isFinite(minimumNonLocalClearance)
      ? minimumNonLocalClearance
      : 0,
    belowGroundSamples,
    taperErrors,
    continuationDiameterErrors,
    lateralDiameterErrors,
  };
}
