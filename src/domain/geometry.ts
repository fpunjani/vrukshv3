import { pointFrom } from "./spatial";
import type { GrowthModule, Point, ProjectedSegment, TreeState } from "./types";

const ROOT: Point = { x: 0, y: 0 };

export interface ProjectedCurve extends ProjectedSegment {
  control1: Point;
  control2: Point;
  startTangent: number;
  endTangent: number;
  startThickness: number;
  endThickness: number;
}

function normalizeDelta(degrees: number): number {
  return ((degrees + 540) % 360) - 180;
}

function blendHeading(from: number, to: number, amount: number): number {
  return from + normalizeDelta(to - from) * amount;
}

function supportByModule(modules: readonly GrowthModule[]): Map<string, number> {
  const support = new Map<string, number>();
  const childCount = new Map<string, number>();

  for (const module of modules) {
    support.set(module.id, 0);
    if (module.parentId) {
      childCount.set(module.parentId, (childCount.get(module.parentId) ?? 0) + 1);
    }
  }

  for (let index = modules.length - 1; index >= 0; index -= 1) {
    const module = modules[index];
    const ownSupport = support.get(module.id) ?? 0;
    const terminalSupport = (childCount.get(module.id) ?? 0) === 0 ? 1 : 0;
    const total = Math.max(1, ownSupport + terminalSupport);
    support.set(module.id, total);
    if (module.parentId) {
      support.set(module.parentId, (support.get(module.parentId) ?? 0) + total);
    }
  }

  return support;
}

function projectedThickness(order: number, support: number): number {
  const orderScale = order === 0 ? 1 : Math.max(0.58, 0.88 - order * 0.08);
  return Math.max(0.9, Math.sqrt(support) * 1.48 * orderScale);
}

export function projectTree(state: TreeState): ProjectedSegment[] {
  const projected = new Map<string, ProjectedSegment>();
  const support = supportByModule(state.modules);
  const result: ProjectedSegment[] = [];

  for (const module of state.modules) {
    const parent = module.parentId ? projected.get(module.parentId) : undefined;
    if (module.parentId && !parent) {
      throw new Error(
        `Growth module ${module.id} references missing parent ${module.parentId}`,
      );
    }

    const start = parent?.end ?? ROOT;
    const heading = (parent?.heading ?? 0) + module.restTurn;
    const length = module.restLength;
    const end = pointFrom(start, heading, length);
    const segment: ProjectedSegment = {
      id: module.id,
      parentId: module.parentId,
      axisId: module.axisId,
      order: module.order,
      bornAtEvent: module.bornAtEvent,
      start,
      end,
      heading,
      length,
      thickness: projectedThickness(module.order, support.get(module.id) ?? 1),
    };
    projected.set(module.id, segment);
    result.push(segment);
  }

  return result;
}

function endThicknessBySegment(
  segments: readonly ProjectedSegment[],
  state: TreeState,
): Map<string, number> {
  const segmentById = new Map(segments.map((segment) => [segment.id, segment]));
  const continuationByParent = new Map<string, ProjectedSegment>();

  for (const module of state.modules) {
    if (module.relation !== "continuation" || !module.parentId) continue;
    const continuation = segmentById.get(module.id);
    if (continuation) continuationByParent.set(module.parentId, continuation);
  }

  const result = new Map<string, number>();
  for (const segment of segments) {
    const continuation = continuationByParent.get(segment.id);
    result.set(
      segment.id,
      continuation
        ? Math.max(0.82, continuation.thickness * 1.02)
        : Math.max(0.72, segment.thickness * 0.58),
    );
  }
  return result;
}

function isRenewal(relation: GrowthModule["relation"]): boolean {
  return relation === "renewal";
}

function curveHandleLength(
  segment: ProjectedSegment,
  relation: GrowthModule["relation"],
  tangent: number,
  atStart: boolean,
): number {
  const baseScale = atStart
    ? relation === "lateral"
      ? 0.17
      : isRenewal(relation)
        ? 0.2
        : 0.24
    : 0.24;
  const deviation = Math.abs(normalizeDelta(tangent - segment.heading));
  const corridorScale = Math.max(0.62, 1 - deviation / 70);
  return segment.length * baseScale * corridorScale;
}

export function projectTreeCurves(state: TreeState): ProjectedCurve[] {
  const segments = projectTree(state);
  const segmentById = new Map(segments.map((segment) => [segment.id, segment]));
  const moduleById = new Map(state.modules.map((module) => [module.id, module]));
  const continuationByParent = new Map<string, string>();
  const projectedEndThickness = endThicknessBySegment(segments, state);

  for (const module of state.modules) {
    if (module.relation === "continuation" && module.parentId) {
      continuationByParent.set(module.parentId, module.id);
    }
  }

  const endTangentById = new Map<string, number>();
  for (const segment of segments) {
    const continuationId = continuationByParent.get(segment.id);
    const continuation = continuationId ? segmentById.get(continuationId) : undefined;
    endTangentById.set(
      segment.id,
      continuation ? blendHeading(segment.heading, continuation.heading, 0.5) : segment.heading,
    );
  }

  const curves = new Map<string, ProjectedCurve>();
  const result: ProjectedCurve[] = [];

  for (const segment of segments) {
    const module = moduleById.get(segment.id);
    if (!module) {
      throw new Error(`Projected segment ${segment.id} has no growth module`);
    }

    const parentSegment = segment.parentId
      ? segmentById.get(segment.parentId)
      : undefined;
    const parentCurve = segment.parentId ? curves.get(segment.parentId) : undefined;
    const parentEndTangent = segment.parentId
      ? endTangentById.get(segment.parentId)
      : undefined;

    let startTangent = segment.heading;
    if (module.relation === "continuation" && parentEndTangent !== undefined) {
      startTangent = parentEndTangent;
    } else if (module.relation === "lateral" && parentSegment) {
      startTangent = blendHeading(parentSegment.heading, segment.heading, 0.72);
    } else if (module.relation === "renewal" && parentSegment) {
      startTangent = blendHeading(parentSegment.heading, segment.heading, 0.5);
    }

    const endTangent = endTangentById.get(segment.id) ?? segment.heading;
    const startHandle = curveHandleLength(
      segment,
      module.relation,
      startTangent,
      true,
    );
    const endHandle = curveHandleLength(
      segment,
      module.relation,
      endTangent,
      false,
    );
    const endThickness =
      projectedEndThickness.get(segment.id) ?? segment.thickness * 0.6;

    let startThickness = segment.thickness * 1.08;
    if (module.relation === "origin") {
      startThickness = segment.thickness * 1.14;
    } else if (module.relation === "continuation" && parentCurve) {
      startThickness = parentCurve.endThickness;
    } else if (module.relation === "lateral" && parentCurve) {
      startThickness = Math.min(
        segment.thickness * 1.05,
        parentCurve.endThickness * 0.72,
      );
    } else if (module.relation === "renewal" && parentCurve) {
      startThickness = Math.min(
        segment.thickness * 1.05,
        parentCurve.endThickness * 0.86,
      );
    }

    const curve: ProjectedCurve = {
      ...segment,
      control1: pointFrom(segment.start, startTangent, startHandle),
      control2: pointFrom(segment.end, endTangent + 180, endHandle),
      startTangent,
      endTangent,
      startThickness,
      endThickness: Math.min(startThickness, endThickness),
    };
    curves.set(curve.id, curve);
    result.push(curve);
  }

  return result;
}

function curvePoint(curve: ProjectedCurve, t: number): Point {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  return {
    x:
      mt2 * mt * curve.start.x +
      3 * mt2 * t * curve.control1.x +
      3 * mt * t2 * curve.control2.x +
      t2 * t * curve.end.x,
    y:
      mt2 * mt * curve.start.y +
      3 * mt2 * t * curve.control1.y +
      3 * mt * t2 * curve.control2.y +
      t2 * t * curve.end.y,
  };
}

export function sampleProjectedCurve(curve: ProjectedCurve, steps = 8): Point[] {
  const count = Math.max(1, Math.floor(steps));
  const points: Point[] = [];
  for (let index = 0; index <= count; index += 1) {
    points.push(curvePoint(curve, index / count));
  }
  return points;
}

export function outlineProjectedCurve(curve: ProjectedCurve, steps = 12): Point[] {
  const centerline = sampleProjectedCurve(curve, steps);
  const left: Point[] = [];
  const right: Point[] = [];
  const last = centerline.length - 1;

  for (let index = 0; index < centerline.length; index += 1) {
    const previous = centerline[Math.max(0, index - 1)];
    const next = centerline[Math.min(last, index + 1)];
    const dx = next.x - previous.x;
    const dy = next.y - previous.y;
    const magnitude = Math.max(1e-9, Math.hypot(dx, dy));
    const nx = -dy / magnitude;
    const ny = dx / magnitude;
    const t = last === 0 ? 0 : index / last;
    const thickness =
      curve.startThickness + (curve.endThickness - curve.startThickness) * t;
    const radius = thickness / 2;
    const point = centerline[index];
    left.push({ x: point.x + nx * radius, y: point.y + ny * radius });
    right.push({ x: point.x - nx * radius, y: point.y - ny * radius });
  }

  return left.concat(right.reverse());
}
