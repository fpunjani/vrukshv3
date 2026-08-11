import { projectTree } from "./geometry";
import { keyedRange } from "./random";
import { deriveScaffoldBalancedMeristemFrontier } from "./mature-meristem-frontier";
import { compareStableStrings } from "./stable-order";
import {
  pointFrom,
  segmentToSegmentDistance,
  segmentToSegmentDistance3D,
} from "./spatial";
import {
  projectTreeSpatial,
  spatialEnd,
  spatialStart,
} from "./spatial-geometry";
import { deriveTreeTraits, type TreeTraits } from "./traits";
import type {
  GrowthModule,
  GrowthRelation,
  Point,
  ProjectedSegment,
  ProjectedSpatialSegment,
  TreeState,
} from "./types";

const TRUNK_AXIS = "axis-0";
const MAX_ORDER = 4;
const MIN_LATERAL_AGE = 3;
const MIN_STRUCTURAL_CLEARANCE = 2.0;
const HARD_MATURE_ASPECT = 1.02;
const MATURE_STRUCTURE_HORIZON = 1000;
const MATURE_TIP_STRUCTURAL_WINDOW = 64;
const MATURE_SCAFFOLD_RESERVE_PER_LINEAGE = 4;
const MATURE_SIDE_STRUCTURAL_WINDOW = 48;

interface Candidate {
  parent: GrowthModule;
  relation: Exclude<GrowthRelation, "origin">;
  axisId: string;
  order: number;
  heading: number;
  length: number;
  depthDelta: number;
  score: number;
}

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface GrowthContext {
  segments: ProjectedSegment[];
  projectedById: Map<string, ProjectedSegment>;
  spatialSegments: ProjectedSpatialSegment[];
  spatialById: Map<string, ProjectedSpatialSegment>;
  bounds: Bounds;
  matureReferenceBounds: Bounds;
  continuationParents: Set<string>;
  successorParents: Set<string>;
  matureContinuationTipIds: ReadonlySet<string>;
  lateralParents: Set<string>;
  axisModuleCounts: Map<string, number>;
  axisCountsByOrder: Map<number, number>;
  establishedFiveByOrder: Map<number, number>;
  lateralFromAxisCounts: Map<string, number>;
  modulePositions: Map<string, number>;
  latestAxisModulePositions: Map<string, number>;
  latestLateralFromAxisPositions: Map<string, number>;
  axisTips: ProjectedSegment[];
  firstOrderAxisTips: ProjectedSegment[];
  axisRootHeadings: Map<string, number>;
}

function structuralInterval(eventIndex: number): number {
  return Math.min(12, 2 + Math.floor(Math.log2(eventIndex + 1)));
}

export function shouldGrowStructure(eventIndex: number): boolean {
  return eventIndex <= 14 || eventIndex % structuralInterval(eventIndex) === 0;
}

function boundsFor(segments: readonly ProjectedSegment[]): Bounds {
  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;

  for (const segment of segments) {
    minX = Math.min(minX, segment.start.x, segment.end.x);
    maxX = Math.max(maxX, segment.start.x, segment.end.x);
    minY = Math.min(minY, segment.start.y, segment.end.y);
    maxY = Math.max(maxY, segment.start.y, segment.end.y);
  }

  return { minX, maxX, minY, maxY };
}

function buildGrowthContext(state: TreeState): GrowthContext {
  const segments = projectTree(state);
  const projectedById = new Map(segments.map((segment) => [segment.id, segment]));
  const spatialSegments = projectTreeSpatial(state);
  const spatialById = new Map(
    spatialSegments.map((segment) => [segment.id, segment]),
  );
  const matureReferenceBounds = boundsFor(
    segments.filter((segment) => segment.bornAtEvent <= MATURE_STRUCTURE_HORIZON),
  );
  const moduleById = new Map(state.modules.map((module) => [module.id, module]));
  const continuationParents = new Set<string>();
  const successorParents = new Set<string>();
  const lateralParents = new Set<string>();
  const axisModuleCounts = new Map<string, number>();
  const axisOrderCounts = new Map<number, Map<string, number>>();
  const lateralFromAxisCounts = new Map<string, number>();
  const modulePositions = new Map<string, number>();
  const latestAxisModulePositions = new Map<string, number>();
  const latestLateralFromAxisPositions = new Map<string, number>();
  const latestFirstOrderModuleByAxis = new Map<string, GrowthModule>();
  const axisRootHeadings = new Map<string, number>();

  for (let index = 0; index < state.modules.length; index += 1) {
    const module = state.modules[index];
    const projection = projectedById.get(module.id);

    axisModuleCounts.set(module.axisId, (axisModuleCounts.get(module.axisId) ?? 0) + 1);
    modulePositions.set(module.id, index);
    latestAxisModulePositions.set(module.axisId, index);

    if (!axisRootHeadings.has(module.axisId) && projection) {
      axisRootHeadings.set(module.axisId, projection.heading);
    }

    const orderCounts = axisOrderCounts.get(module.order) ?? new Map<string, number>();
    orderCounts.set(module.axisId, (orderCounts.get(module.axisId) ?? 0) + 1);
    axisOrderCounts.set(module.order, orderCounts);

    if (module.order === 1) {
      latestFirstOrderModuleByAxis.set(module.axisId, module);
    }

    if (
      module.parentId &&
      (module.relation === "continuation" || module.relation === "renewal")
    ) {
      successorParents.add(module.parentId);
    }
    if (module.parentId && module.relation === "continuation") {
      continuationParents.add(module.parentId);
    }

    if (module.parentId && module.relation === "lateral") {
      lateralParents.add(module.parentId);
      const parentAxis = moduleById.get(module.parentId)?.axisId;
      if (parentAxis) {
        lateralFromAxisCounts.set(
          parentAxis,
          (lateralFromAxisCounts.get(parentAxis) ?? 0) + 1,
        );
        latestLateralFromAxisPositions.set(parentAxis, index);
      }
    }
  }

  const axisCountsByOrder = new Map<number, number>();
  const establishedFiveByOrder = new Map<number, number>();

  for (const [order, counts] of axisOrderCounts) {
    axisCountsByOrder.set(order, counts.size);
    establishedFiveByOrder.set(
      order,
      [...counts.values()].filter((count) => count >= 5).length,
    );
  }

  const axisTips = state.modules
    .filter((module) => !successorParents.has(module.id))
    .map((module) => projectedById.get(module.id))
    .filter((segment): segment is ProjectedSegment => Boolean(segment));

  const firstOrderAxisTips = [...latestFirstOrderModuleByAxis.values()]
    .map((module) => projectedById.get(module.id))
    .filter((segment): segment is ProjectedSegment => Boolean(segment));

  const matureContinuationTipIds = deriveScaffoldBalancedMeristemFrontier(
    state.modules,
    MATURE_STRUCTURE_HORIZON,
    MATURE_TIP_STRUCTURAL_WINDOW,
    MATURE_SCAFFOLD_RESERVE_PER_LINEAGE,
  ).selectedTipIds;

  return {
    segments,
    projectedById,
    spatialSegments,
    spatialById,
    bounds: boundsFor(segments),
    matureReferenceBounds,
    continuationParents,
    successorParents,
    matureContinuationTipIds,
    lateralParents,
    axisModuleCounts,
    axisCountsByOrder,
    establishedFiveByOrder,
    lateralFromAxisCounts,
    modulePositions,
    latestAxisModulePositions,
    latestLateralFromAxisPositions,
    axisTips,
    firstOrderAxisTips,
    axisRootHeadings,
  };
}

function preferredAxisModules(order: number, traits: TreeTraits): number {
  if (order === 0) {
    const normalizedDominance =
      (traits.apicalDominance - 0.58) / Math.max(0.001, 0.84 - 0.58);
    return 9 + Math.max(0, Math.min(1, normalizedDominance)) * 3;
  }
  if (order === 1) return 7;
  if (order === 2) return 5;
  if (order === 3) return 4;
  return 3;
}

function minimumAxisModulesBeforeLateral(
  order: number,
  traits: TreeTraits,
): number {
  if (order === 0) {
    return Math.max(6, Math.floor(preferredAxisModules(0, traits) - 4));
  }
  if (order === 1) return 6;
  if (order === 2) return 3;
  return 3;
}

function lengthRange(order: number): readonly [number, number] {
  if (order <= 0) return [16, 21];
  if (order === 1) return [13, 18];
  if (order === 2) return [10, 15];
  if (order === 3) return [7.5, 12];
  return [5.5, 9];
}

function candidateLength(
  state: TreeState,
  context: GrowthContext,
  eventIndex: number,
  parent: GrowthModule,
  relation: Exclude<GrowthRelation, "origin">,
  order: number,
  traits: TreeTraits,
): number {
  const [min, max] = lengthRange(order);
  let scale = relation === "continuation" ? 1 : 0.94;

  if (relation === "continuation" && order === 0) {
    const axisModules = context.axisModuleCounts.get(parent.axisId) ?? 0;
    const preferred = preferredAxisModules(0, traits);
    const excess = Math.max(0, axisModules - preferred);
    scale *= Math.max(0.7, 1 - excess * 0.055);
  }

  return (
    keyedRange(
      state.soul,
      `structure:${eventIndex}:${parent.id}:${relation}:length`,
      min,
      max,
    ) * scale
  );
}

function proposedClearance(
  start: Point,
  end: Point,
  parentId: string,
  segments: readonly ProjectedSegment[],
): number {
  let clearance = Number.POSITIVE_INFINITY;

  for (const segment of segments) {
    if (segment.id === parentId || segment.parentId === parentId) continue;
    clearance = Math.min(
      clearance,
      segmentToSegmentDistance(start, end, segment.start, segment.end),
    );
    if (clearance === 0) return 0;
  }

  return Number.isFinite(clearance)
    ? clearance
    : Math.hypot(end.x - start.x, end.y - start.y);
}

function predictedBounds(bounds: Bounds, end: Point): Bounds {
  return {
    minX: Math.min(bounds.minX, end.x),
    maxX: Math.max(bounds.maxX, end.x),
    minY: Math.min(bounds.minY, end.y),
    maxY: Math.max(bounds.maxY, end.y),
  };
}

function boundsAspect(bounds: Bounds): number {
  const width = Math.max(1, bounds.maxX - bounds.minX);
  const height = Math.max(1, bounds.maxY - bounds.minY);
  return width / height;
}

function matureDepthHalfSpan(
  context: GrowthContext,
  eventIndex: number,
): number {
  if (eventIndex <= MATURE_STRUCTURE_HORIZON) return 0;
  const referenceWidth = Math.max(1,
    context.matureReferenceBounds.maxX - context.matureReferenceBounds.minX,
  );
  return (
    2 +
    referenceWidth *
      0.08 *
      Math.log2(Math.max(1, eventIndex / MATURE_STRUCTURE_HORIZON))
  );
}

function insideMatureVolume(
  context: GrowthContext,
  eventIndex: number,
  end: Point,
  endDepth: number,
): boolean {
  if (eventIndex <= MATURE_STRUCTURE_HORIZON) {
    return Math.abs(endDepth) <= 1e-12;
  }

  const ageLog = Math.log2(
    Math.max(1, eventIndex / MATURE_STRUCTURE_HORIZON),
  );
  const horizontalScale = 1 + ageLog * 0.18;
  const verticalScale = 1 + ageLog * 0.14;
  const reference = context.matureReferenceBounds;
  const cushion = 6;
  const depthHalfSpan = matureDepthHalfSpan(context, eventIndex);

  return (
    end.x >= reference.minX * horizontalScale - cushion - 1e-9 &&
    end.x <= reference.maxX * horizontalScale + cushion + 1e-9 &&
    end.y >= reference.minY * verticalScale - cushion - 1e-9 &&
    end.y <= 1e-9 &&
    Math.abs(endDepth) <= depthHalfSpan + 1e-9
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function candidateDepthDelta(
  state: TreeState,
  context: GrowthContext,
  eventIndex: number,
  parent: GrowthModule,
  relation: Exclude<GrowthRelation, "origin">,
  axisId: string,
  length: number,
  sideKey = 0,
): number {
  if (eventIndex <= MATURE_STRUCTURE_HORIZON) return 0;

  const spatialParent = context.spatialById.get(parent.id);
  if (!spatialParent) return 0;

  const cap = length * 0.3;
  let raw: number;

  if (relation === "continuation") {
    const axisTendency = keyedRange(
      state.soul,
      `mechanics:${axisId}:depth-tendency`,
      -0.18,
      0.18,
    ) * length;
    const drift = keyedRange(
      state.soul,
      `structure:${eventIndex}:${parent.id}:continue:depth-drift`,
      -0.035,
      0.035,
    ) * length;
    raw = parent.restDepth * 0.72 + axisTendency * 0.28 + drift;
  } else {
    const sign =
      keyedRange(
        state.soul,
        `structure:${eventIndex}:${parent.id}:${relation}:${sideKey}:depth-side`,
        -1,
        1,
      ) >= 0
        ? 1
        : -1;
    const magnitude = keyedRange(
      state.soul,
      `structure:${eventIndex}:${parent.id}:${relation}:${sideKey}:depth-magnitude`,
      0.12,
      0.24,
    );
    raw = sign * magnitude * length;
  }

  const depthHalfSpan = matureDepthHalfSpan(context, eventIndex);
  const minimumDelta = -depthHalfSpan - spatialParent.endDepth;
  const maximumDelta = depthHalfSpan - spatialParent.endDepth;
  return clamp(raw, Math.max(-cap, minimumDelta), Math.min(cap, maximumDelta));
}

function proposedSpatialClearance(
  startDepth: number,
  endDepth: number,
  start: Point,
  end: Point,
  parentId: string,
  segments: readonly ProjectedSpatialSegment[],
): number {
  let clearance = Number.POSITIVE_INFINITY;
  const candidateStart = { x: start.x, y: start.y, z: startDepth };
  const candidateEnd = { x: end.x, y: end.y, z: endDepth };

  for (const segment of segments) {
    if (segment.id === parentId || segment.parentId === parentId) continue;
    clearance = Math.min(
      clearance,
      segmentToSegmentDistance3D(
        candidateStart,
        candidateEnd,
        spatialStart(segment),
        spatialEnd(segment),
      ),
    );
    if (clearance === 0) return 0;
  }

  return Number.isFinite(clearance)
    ? clearance
    : Math.hypot(
        end.x - start.x,
        end.y - start.y,
        endDepth - startDepth,
      );
}

function violatesBroadCrownEnvelope(
  current: Bounds,
  proposedEnd: Point,
  moduleCount: number,
): boolean {
  if (moduleCount < 18) return false;

  const currentAspect = boundsAspect(current);
  const nextAspect = boundsAspect(predictedBounds(current, proposedEnd));
  return nextAspect > HARD_MATURE_ASPECT && nextAspect > currentAspect + 1e-6;
}

function crownEnvelopeScore(
  current: Bounds,
  proposedEnd: Point,
  traits: TreeTraits,
  moduleCount: number,
): number {
  if (moduleCount < 8) return 0;

  const next = predictedBounds(current, proposedEnd);
  const width = Math.max(1, next.maxX - next.minX);
  const height = Math.max(1, next.maxY - next.minY);
  const aspect = width / height;
  const aspectError = Math.abs(aspect - traits.crownAspect);
  const softMaximumAspect = Math.min(0.98, traits.crownAspect * 1.14 + 0.08);
  const overspread = Math.max(0, aspect - softMaximumAspect);

  const centre = (next.minX + next.maxX) / 2;
  const targetCentre = Math.tan((traits.lean * Math.PI) / 180) * height * 0.3;
  const centreError = Math.abs(centre - targetCentre) / Math.max(30, height);

  return -aspectError * 0.65 - overspread * 2.6 - centreError * 0.55;
}

function crownGapScore(
  state: TreeState,
  context: GrowthContext,
  proposedEnd: Point,
  candidateLengthValue: number,
  traits: TreeTraits,
): number {
  if (state.modules.length < 10) return 0;

  const height = Math.max(60, -context.bounds.minY);
  const proposedHeight = Math.max(0, -proposedEnd.y / height);
  const sameBand = context.axisTips.filter((tip) => {
    const tipHeight = Math.max(0, -tip.end.y / height);
    return Math.abs(tipHeight - proposedHeight) <= 0.18;
  });

  let gapBonus = 0.5;
  if (sameBand.length > 0) {
    const nearestX = Math.min(
      ...sameBand.map((tip) => Math.abs(tip.end.x - proposedEnd.x)),
    );
    gapBonus = Math.min(
      0.75,
      nearestX / Math.max(12, candidateLengthValue * 2.2),
    );
  }

  const targetCentre =
    Math.tan((traits.lean * Math.PI) / 180) *
    Math.max(20, -proposedEnd.y) *
    0.25;
  const proposedSide = proposedEnd.x >= targetCentre ? 1 : -1;
  let sameSide = 0;
  let oppositeSide = 0;

  for (const tip of context.axisTips) {
    const tipSide = tip.end.x >= targetCentre ? 1 : -1;
    if (tipSide === proposedSide) sameSide += 1;
    else oppositeSide += 1;
  }

  const sideBalance =
    sameSide < oppositeSide
      ? 0.18
      : sameSide > oppositeSide + 1
        ? -0.12
        : 0;

  return gapBonus + sideBalance;
}

interface NormalizedVolumePoint {
  x: number;
  y: number;
  z: number;
}

function normalizedMaturePoint(
  context: GrowthContext,
  eventIndex: number,
  point: Point,
  depth: number,
): NormalizedVolumePoint {
  const ageLog = Math.log2(
    Math.max(1, eventIndex / MATURE_STRUCTURE_HORIZON),
  );
  const horizontalScale = 1 + ageLog * 0.18;
  const verticalScale = 1 + ageLog * 0.14;
  const reference = context.matureReferenceBounds;
  const cushion = 6;
  const minX = reference.minX * horizontalScale - cushion;
  const maxX = reference.maxX * horizontalScale + cushion;
  const topY = reference.minY * verticalScale - cushion;
  const depthHalfSpan = Math.max(1e-6, matureDepthHalfSpan(context, eventIndex));

  return {
    x: clamp((point.x - minX) / Math.max(1e-6, maxX - minX) * 2 - 1, -1.25, 1.25),
    y: clamp((-point.y) / Math.max(1e-6, -topY), 0, 1.25),
    z: clamp(depth / depthHalfSpan, -1.25, 1.25),
  };
}

function matureAttractor(
  soul: string,
  index: number,
): NormalizedVolumePoint {
  let x = keyedRange(soul, `mature-volume:${index}:x`, -0.82, 0.82);
  let z = keyedRange(soul, `mature-volume:${index}:z`, -0.82, 0.82);
  const radial = Math.hypot(x, z);
  if (radial > 0.88) {
    const scale = 0.88 / radial;
    x *= scale;
    z *= scale;
  }

  return {
    x,
    y: keyedRange(soul, `mature-volume:${index}:y`, 0.28, 0.92),
    z,
  };
}

interface MatureAttractorWorldPoint {
  x: number;
  y: number;
  z: number;
}

function matureAttractorWorldPoint(
  context: GrowthContext,
  eventIndex: number,
  attractor: NormalizedVolumePoint,
): MatureAttractorWorldPoint {
  const ageLog = Math.log2(
    Math.max(1, eventIndex / MATURE_STRUCTURE_HORIZON),
  );
  const horizontalScale = 1 + ageLog * 0.18;
  const verticalScale = 1 + ageLog * 0.14;
  const reference = context.matureReferenceBounds;
  const cushion = 6;
  const minX = reference.minX * horizontalScale - cushion;
  const maxX = reference.maxX * horizontalScale + cushion;
  const topY = reference.minY * verticalScale - cushion;
  const depthHalfSpan = matureDepthHalfSpan(context, eventIndex);

  return {
    x: minX + ((attractor.x + 1) / 2) * (maxX - minX),
    y: attractor.y * topY,
    z: attractor.z * depthHalfSpan,
  };
}

function headingToward(start: Point, target: Point): number {
  return (Math.atan2(target.x - start.x, -(target.y - start.y)) * 180) / Math.PI;
}

function normalizeHeadingDelta(degrees: number): number {
  return ((degrees + 540) % 360) - 180;
}

function matureSteeringAttractors(
  state: TreeState,
  context: GrowthContext,
  eventIndex: number,
  parentPoint: Point,
  parentDepth: number,
  limit = 2,
): NormalizedVolumePoint[] {
  const terminalTips = context.axisTips
    .map((tip) => context.spatialById.get(tip.id))
    .filter((tip): tip is ProjectedSpatialSegment => Boolean(tip))
    .map((tip) =>
      normalizedMaturePoint(context, eventIndex, tip.end, tip.endDepth),
    );
  const parentNormalized = normalizedMaturePoint(
    context,
    eventIndex,
    parentPoint,
    parentDepth,
  );
  const KILL_RADIUS = 0.13;
  const available: Array<{ attractor: NormalizedVolumePoint; distance: number; index: number }> = [];

  for (let index = 0; index < 32; index += 1) {
    const attractor = matureAttractor(state.soul, index);
    let currentDistance = Number.POSITIVE_INFINITY;
    for (const tip of terminalTips) {
      currentDistance = Math.min(
        currentDistance,
        normalizedDistance(tip, attractor),
      );
    }
    if (currentDistance <= KILL_RADIUS) continue;
    available.push({
      attractor,
      distance: normalizedDistance(parentNormalized, attractor),
      index,
    });
  }

  available.sort(
    (a, b) => a.distance - b.distance || a.index - b.index,
  );
  return available.slice(0, Math.max(0, limit)).map((item) => item.attractor);
}

function steeredContinuationDepthDelta(
  context: GrowthContext,
  eventIndex: number,
  spatialParent: ProjectedSpatialSegment,
  targetDepth: number,
  length: number,
): number {
  const cap = length * 0.3;
  const desired = (targetDepth - spatialParent.endDepth) * 0.45;
  const depthHalfSpan = matureDepthHalfSpan(context, eventIndex);
  const minimumDelta = -depthHalfSpan - spatialParent.endDepth;
  const maximumDelta = depthHalfSpan - spatialParent.endDepth;
  return clamp(
    desired,
    Math.max(-cap, minimumDelta),
    Math.min(cap, maximumDelta),
  );
}

function normalizedDistance(
  a: NormalizedVolumePoint,
  b: NormalizedVolumePoint,
): number {
  // Height remains visually important, while Z is real developmental space but
  // slightly compressed so a branch cannot win solely by fleeing in depth.
  return Math.hypot(
    a.x - b.x,
    (a.y - b.y) * 1.08,
    (a.z - b.z) * 0.82,
  );
}

function matureVolumeOpportunityScore(
  state: TreeState,
  context: GrowthContext,
  eventIndex: number,
  proposedEnd: Point,
  proposedDepth: number,
): number {
  const candidate = normalizedMaturePoint(
    context,
    eventIndex,
    proposedEnd,
    proposedDepth,
  );
  const terminalTips = context.axisTips
    .map((tip) => context.spatialById.get(tip.id))
    .filter((tip): tip is ProjectedSpatialSegment => Boolean(tip))
    .map((tip) =>
      normalizedMaturePoint(context, eventIndex, tip.end, tip.endDepth),
    );

  const improvements: number[] = [];
  const ATTRACTOR_COUNT = 32;
  const KILL_RADIUS = 0.13;

  for (let index = 0; index < ATTRACTOR_COUNT; index += 1) {
    const attractor = matureAttractor(state.soul, index);
    let currentDistance = Number.POSITIVE_INFINITY;
    for (const tip of terminalTips) {
      currentDistance = Math.min(
        currentDistance,
        normalizedDistance(tip, attractor),
      );
    }
    if (!Number.isFinite(currentDistance)) currentDistance = 2;
    if (currentDistance <= KILL_RADIUS) continue;

    const candidateDistance = normalizedDistance(candidate, attractor);
    const improvement = currentDistance - candidateDistance;
    if (improvement > 0) improvements.push(improvement);
  }

  if (improvements.length === 0) return 0;
  improvements.sort((a, b) => b - a);
  const strongest = improvements.slice(0, 4);
  const totalImprovement = strongest.reduce((sum, value) => sum + value, 0);
  return Math.min(1.05, totalImprovement * 4.2);
}

function firstOrderSideScore(
  proposedEnd: Point,
  context: GrowthContext,
  traits: TreeTraits,
): number {
  if (context.firstOrderAxisTips.length === 0) return 0.2;

  let left = 0;
  let right = 0;

  for (const tip of context.firstOrderAxisTips) {
    const centre =
      Math.tan((traits.lean * Math.PI) / 180) *
      Math.max(20, -tip.end.y) *
      0.25;
    if (tip.end.x < centre) left += 1;
    else right += 1;
  }

  const proposedCentre =
    Math.tan((traits.lean * Math.PI) / 180) *
    Math.max(20, -proposedEnd.y) *
    0.25;
  const proposedLeft = proposedEnd.x < proposedCentre;
  const same = proposedLeft ? left : right;
  const other = proposedLeft ? right : left;

  if (same < other) return 0.38;
  if (same > other) return -0.2;
  return 0.08;
}

function baseVigor(
  relation: Exclude<GrowthRelation, "origin">,
  order: number,
  parentAge: number,
  traits: TreeTraits,
): number {
  if (relation === "continuation") {
    return 1.28 + (traits.apicalDominance * 1.3) / (1 + order * 0.55);
  }

  const budAge = Math.max(0, parentAge - MIN_LATERAL_AGE);
  const accumulatedReadiness = Math.min(1.6, budAge * 0.13);
  return (
    1.0 +
    (1 - traits.apicalDominance) * 0.7 +
    accumulatedReadiness -
    order * 0.14
  );
}

function structuralRecencyPenalty(
  state: TreeState,
  context: GrowthContext,
  candidate: Omit<Candidate, "score">,
): number {
  const position =
    candidate.relation === "continuation"
      ? context.latestAxisModulePositions.get(candidate.parent.axisId) ?? -1
      : context.latestLateralFromAxisPositions.get(candidate.parent.axisId) ?? -1;

  if (position < 0) return 0;

  const structuralGap = state.modules.length - 1 - position;
  if (structuralGap === 0) return 0.72;
  if (structuralGap === 1) return 0.34;
  return 0;
}

function architectureScore(
  state: TreeState,
  context: GrowthContext,
  candidate: Omit<Candidate, "score">,
  traits: TreeTraits,
): number {
  const axisModules = context.axisModuleCounts.get(candidate.parent.axisId) ?? 0;
  const preferred = preferredAxisModules(candidate.order, traits);

  if (candidate.relation === "continuation") {
    const deficit = Math.max(0, preferred - axisModules);
    const excess = Math.max(0, axisModules - preferred);

    if (candidate.order === 0) {
      const earlyLeaderBonus = Math.min(0.9, deficit * 0.14);
      const order1Axes = context.axisCountsByOrder.get(1) ?? 0;
      const establishedScaffolds = context.establishedFiveByOrder.get(1) ?? 0;
      const crownFormationPressure = Math.min(
        1.45,
        Math.max(0, state.modules.length - 10) * 0.025 +
          order1Axes * 0.16 +
          establishedScaffolds * 0.18,
      );
      return earlyLeaderBonus - excess * 0.38 - crownFormationPressure;
    }

    const establishmentBonus = Math.min(2.5, deficit * 0.52);
    return establishmentBonus - excess * 0.3;
  }

  const laterals = context.lateralFromAxisCounts.get(candidate.parent.axisId) ?? 0;
  const branchDensity = laterals / Math.max(1, axisModules - 1);
  const parentEstablishmentTarget = minimumAxisModulesBeforeLateral(
    candidate.parent.order,
    traits,
  );
  const underEstablishedPenalty =
    axisModules < parentEstablishmentTarget
      ? (parentEstablishmentTarget - axisModules) * 0.8
      : 0;

  return -branchDensity * 2.6 - underEstablishedPenalty;
}

function axisLightTarget(
  state: TreeState,
  context: GrowthContext,
  parent: GrowthModule,
  projection: ProjectedSegment,
  traits: TreeTraits,
): number {
  if (parent.order === 0) return traits.lean;

  const rootHeading = context.axisRootHeadings.get(parent.axisId) ?? projection.heading;
  const relativeRoot = rootHeading - traits.lean * 0.3;
  const fallbackSide =
    keyedRange(state.soul, `mechanics:${parent.axisId}:side`, -1, 1) >= 0 ? 1 : -1;
  const side = Math.abs(relativeRoot) >= 1 ? Math.sign(relativeRoot) : fallbackSide;

  let min = 5;
  let max = 18;
  if (parent.order === 1) [min, max] = [16, 30];
  else if (parent.order === 2) [min, max] = [10, 24];
  else if (parent.order === 3) [min, max] = [7, 20];

  const targetMagnitude = keyedRange(
    state.soul,
    `mechanics:${parent.axisId}:light-heading`,
    min,
    max,
  );

  return traits.lean * 0.35 + side * targetMagnitude;
}

function continuationTropismStrength(order: number, axisModules: number): number {
  if (order === 0) return 0.16;
  if (order === 1) {
    if (axisModules < 6) return 0;
    return Math.min(0.18, 0.12 + (axisModules - 6) * 0.025);
  }
  if (order === 2) return 0.13;
  if (order === 3) return 0.16;
  return 0.18;
}

function lateralDivergence(
  state: TreeState,
  eventIndex: number,
  parent: GrowthModule,
  childOrder: number,
  traits: TreeTraits,
): number {
  let orderScale = 1;
  if (childOrder === 2) orderScale = 0.82;
  else if (childOrder === 3) orderScale = 0.68;
  else if (childOrder >= 4) orderScale = 0.58;

  const familyScale = keyedRange(
    state.soul,
    `mechanics:${eventIndex}:${parent.id}:lateral-angle-scale`,
    0.92,
    1.08,
  );

  return traits.branchAngle * orderScale * familyScale;
}

function scoreCandidate(
  state: TreeState,
  context: GrowthContext,
  eventIndex: number,
  candidate: Omit<Candidate, "score">,
  traits: TreeTraits,
): Candidate | null {
  const parent = context.projectedById.get(candidate.parent.id);
  const spatialParent = context.spatialById.get(candidate.parent.id);
  if (!parent || !spatialParent) return null;

  const start = parent.end;
  const end = pointFrom(start, candidate.heading, candidate.length);
  const endDepth = spatialParent.endDepth + candidate.depthDelta;

  if (!Number.isFinite(end.x) || !Number.isFinite(end.y) || end.y > 0) {
    return null;
  }
  if (candidate.length <= 0.5) return null;
  if (!insideMatureVolume(context, eventIndex, end, endDepth)) return null;
  if (violatesBroadCrownEnvelope(context.bounds, end, state.modules.length)) {
    return null;
  }

  const clearance =
    eventIndex <= MATURE_STRUCTURE_HORIZON
      ? proposedClearance(
          start,
          end,
          candidate.parent.id,
          context.segments,
        )
      : proposedSpatialClearance(
          spatialParent.endDepth,
          endDepth,
          start,
          end,
          candidate.parent.id,
          context.spatialSegments,
        );
  if (clearance < MIN_STRUCTURAL_CLEARANCE) return null;

  const parentAge = state.growthIndex - candidate.parent.bornAtEvent;
  const spaceScore = Math.min(
    1.45,
    clearance / Math.max(4, candidate.length * 0.45),
  );
  const firstOrderSide =
    candidate.relation === "lateral" && candidate.order === 1
      ? firstOrderSideScore(end, context, traits)
      : 0;
  const opportunityScore =
    eventIndex <= MATURE_STRUCTURE_HORIZON
      ? crownGapScore(state, context, end, candidate.length, traits)
      : matureVolumeOpportunityScore(
          state,
          context,
          eventIndex,
          end,
          endDepth,
        );
  const jitter = keyedRange(
    state.soul,
    `structure:${eventIndex}:${candidate.parent.id}:${candidate.relation}:${candidate.heading}:jitter`,
    -0.1,
    0.1,
  );

  const score =
    baseVigor(candidate.relation, candidate.order, parentAge, traits) +
    spaceScore * 0.78 +
    crownEnvelopeScore(context.bounds, end, traits, state.modules.length) +
    opportunityScore +
    firstOrderSide +
    architectureScore(state, context, candidate, traits) -
    structuralRecencyPenalty(state, context, candidate) +
    jitter;

  return { ...candidate, score };
}

function continuationCandidates(
  state: TreeState,
  context: GrowthContext,
  eventIndex: number,
  traits: TreeTraits,
): Candidate[] {
  const result: Candidate[] = [];

  for (const parent of state.modules) {
    if (parent.order > MAX_ORDER) continue;
    if (context.successorParents.has(parent.id)) continue;

    if (eventIndex > MATURE_STRUCTURE_HORIZON) {
      if (parent.order === 0) {
        // Keep the established trunk treatment exactly as JE0. Scaffold
        // balancing applies only to non-trunk living meristems.
        const latestAxisPosition = context.latestAxisModulePositions.get(parent.axisId);
        if (latestAxisPosition === undefined) continue;
        const structuralDormancy = state.modules.length - 1 - latestAxisPosition;
        if (structuralDormancy > MATURE_TIP_STRUCTURAL_WINDOW) continue;
      } else if (!context.matureContinuationTipIds.has(parent.id)) {
        continue;
      }
    }

    const projection = context.projectedById.get(parent.id);
    if (!projection) continue;

    const axisModules = context.axisModuleCounts.get(parent.axisId) ?? 1;
    const targetHeading = axisLightTarget(state, context, parent, projection, traits);
    const tropism =
      (targetHeading - projection.heading) *
      continuationTropismStrength(parent.order, axisModules);
    const localNoise = keyedRange(
      state.soul,
      `structure:${eventIndex}:${parent.id}:continue:curve`,
      -traits.curvature,
      traits.curvature,
    );
    const noiseScale = parent.order === 0 ? 0.3 : 0.18;
    const baseHeading = projection.heading + tropism + localNoise * noiseScale;
    const offsetScale = parent.order === 0 ? 0.9 : 0.72;
    const offsets = [
      -traits.curvature * offsetScale,
      0,
      traits.curvature * offsetScale,
    ];
    const length = candidateLength(
      state,
      context,
      eventIndex,
      parent,
      "continuation",
      parent.order,
      traits,
    );
    const depthDelta = candidateDepthDelta(
      state,
      context,
      eventIndex,
      parent,
      "continuation",
      parent.axisId,
      length,
    );

    for (const offset of offsets) {
      const heading = Math.max(-82, Math.min(82, baseHeading + offset));
      const scored = scoreCandidate(
        state,
        context,
        eventIndex,
        {
          parent,
          relation: "continuation",
          axisId: parent.axisId,
          order: parent.order,
          heading,
          length,
          depthDelta,
        },
        traits,
      );
      if (scored) result.push(scored);
    }

    if (eventIndex > MATURE_STRUCTURE_HORIZON) {
      const spatialParent = context.spatialById.get(parent.id);
      if (!spatialParent) continue;
      const targets = matureSteeringAttractors(
        state,
        context,
        eventIndex,
        projection.end,
        spatialParent.endDepth,
        2,
      );

      for (const target of targets) {
        const worldTarget = matureAttractorWorldPoint(context, eventIndex, target);
        const desiredHeading = headingToward(projection.end, worldTarget);
        const turn = clamp(
          normalizeHeadingDelta(desiredHeading - baseHeading),
          -16,
          16,
        );
        const heading = clamp(baseHeading + turn, -82, 82);
        const steeredDepthDelta = steeredContinuationDepthDelta(
          context,
          eventIndex,
          spatialParent,
          worldTarget.z,
          length,
        );
        const scored = scoreCandidate(
          state,
          context,
          eventIndex,
          {
            parent,
            relation: "continuation",
            axisId: parent.axisId,
            order: parent.order,
            heading,
            length,
            depthDelta: steeredDepthDelta,
          },
          traits,
        );
        if (scored) result.push(scored);
      }
    }
  }

  return result;
}

function lateralCandidates(
  state: TreeState,
  context: GrowthContext,
  eventIndex: number,
  traits: TreeTraits,
): Candidate[] {
  const result: Candidate[] = [];

  for (const parent of state.modules) {
    if (parent.order >= MAX_ORDER) continue;
    if (context.lateralParents.has(parent.id)) continue;
    if (!context.continuationParents.has(parent.id)) continue;
    if (state.growthIndex - parent.bornAtEvent < MIN_LATERAL_AGE) continue;

    if (eventIndex > MATURE_STRUCTURE_HORIZON) {
      if (parent.order === 0) continue;
      const parentPosition = context.modulePositions.get(parent.id);
      if (parentPosition === undefined) continue;
      const structuralAge = state.modules.length - 1 - parentPosition;
      if (structuralAge > MATURE_SIDE_STRUCTURAL_WINDOW) continue;
    }

    const axisModules = context.axisModuleCounts.get(parent.axisId) ?? 0;
    if (axisModules < minimumAxisModulesBeforeLateral(parent.order, traits)) {
      continue;
    }

    const projection = context.projectedById.get(parent.id);
    if (!projection) continue;

    const order = parent.order + 1;
    const divergence = lateralDivergence(
      state,
      eventIndex,
      parent,
      order,
      traits,
    );
    const length = candidateLength(
      state,
      context,
      eventIndex,
      parent,
      "lateral",
      order,
      traits,
    );

    for (const side of [-1, 1] as const) {
      const rawHeading = projection.heading + side * divergence;
      const heading = Math.max(-82, Math.min(82, rawHeading * 0.97));
      const depthDelta = candidateDepthDelta(
        state,
        context,
        eventIndex,
        parent,
        "lateral",
        `axis-${eventIndex}`,
        length,
        side,
      );
      const scored = scoreCandidate(
        state,
        context,
        eventIndex,
        {
          parent,
          relation: "lateral",
          axisId: `axis-${eventIndex}`,
          order,
          heading,
          length,
          depthDelta,
        },
        traits,
      );
      if (scored) result.push(scored);
    }
  }

  return result;
}

function renewalCandidates(
  state: TreeState,
  context: GrowthContext,
  eventIndex: number,
  traits: TreeTraits,
): Candidate[] {
  if (eventIndex <= MATURE_STRUCTURE_HORIZON) return [];

  const result: Candidate[] = [];

  for (const parent of state.modules) {
    if (parent.order !== MAX_ORDER) continue;
    if (context.successorParents.has(parent.id)) continue;

    const parentPosition = context.modulePositions.get(parent.id);
    if (parentPosition === undefined) continue;
    const structuralAge = state.modules.length - 1 - parentPosition;
    if (structuralAge > MATURE_SIDE_STRUCTURAL_WINDOW) continue;

    const axisModules = context.axisModuleCounts.get(parent.axisId) ?? 0;
    if (axisModules < preferredAxisModules(MAX_ORDER, traits)) continue;

    const projection = context.projectedById.get(parent.id);
    if (!projection) continue;

    const divergence =
      lateralDivergence(state, eventIndex, parent, MAX_ORDER, traits) * 0.55;
    const length = candidateLength(
      state,
      context,
      eventIndex,
      parent,
      "renewal",
      MAX_ORDER,
      traits,
    );

    for (const side of [-1, 1] as const) {
      const heading = Math.max(
        -82,
        Math.min(82, projection.heading + side * divergence),
      );
      const depthDelta = candidateDepthDelta(
        state,
        context,
        eventIndex,
        parent,
        "renewal",
        `axis-${eventIndex}`,
        length,
        side,
      );
      const scored = scoreCandidate(
        state,
        context,
        eventIndex,
        {
          parent,
          relation: "renewal",
          axisId: `axis-${eventIndex}`,
          order: MAX_ORDER,
          heading,
          length,
          depthDelta,
        },
        traits,
      );
      if (scored) result.push(scored);
    }
  }

  return result;
}

function initialModule(
  state: TreeState,
  eventIndex: number,
  traits: TreeTraits,
): GrowthModule {
  return {
    id: `m-${eventIndex}`,
    parentId: null,
    axisId: TRUNK_AXIS,
    relation: "origin",
    order: 0,
    bornAtEvent: eventIndex,
    restTurn:
      traits.lean * 0.38 +
      keyedRange(
        state.soul,
        `structure:${eventIndex}:origin:turn`,
        -1.2,
        1.2,
      ),
    restLength: keyedRange(
      state.soul,
      `structure:${eventIndex}:origin:length`,
      21,
      25,
    ),
    restDepth: 0,
  };
}

export interface MatureCandidateReachabilityDiagnostics {
  eventIndex: number;
  legalCandidates: number;
  distinctParents: number;
  continuationCandidates: number;
  lateralCandidates: number;
  renewalCandidates: number;
  continuationParents: number;
  meanContinuationHeadingSpan: number;
  maxContinuationHeadingSpan: number;
  meanContinuationDepthOptions: number;
  continuationParentsWithMultipleDepthOptions: number;
  projectedInwardCandidateFraction: number;
  radialInwardCandidateFraction: number;
  uncolonizedAttractors: number;
  improvableAttractors: number;
  meaningfulImprovableAttractors: number;
  improvableAttractorFraction: number;
  meaningfulImprovableAttractorFraction: number;
  meanBestAttractorImprovement: number;
  maxBestAttractorImprovement: number;
  candidatesWithPositiveOpportunity: number;
  bestOpportunityScore: number;
  winnerOpportunityScore: number;
  winnerOpportunityRank: number;
  winnerIsBestOpportunity: boolean;
  winnerParentId: string | null;
  winnerRelation: Exclude<GrowthRelation, "origin"> | null;
  winnerScore: number;
}

function candidateSort(a: Candidate, b: Candidate): number {
  return (
    b.score - a.score ||
    a.order - b.order ||
    compareStableStrings(a.parent.id, b.parent.id) ||
    a.heading - b.heading ||
    a.depthDelta - b.depthDelta
  );
}

/**
 * Observational helper for JE3. It calls the exact mature candidate generators
 * and legality/scoring path used by growStructuralEvent; it never mutates state.
 */
export function diagnoseMatureCandidateReachability(
  state: TreeState,
  eventIndex: number,
): MatureCandidateReachabilityDiagnostics | null {
  if (
    eventIndex <= MATURE_STRUCTURE_HORIZON ||
    state.modules.length === 0 ||
    !shouldGrowStructure(eventIndex)
  ) {
    return null;
  }

  const traits = deriveTreeTraits(state.soul);
  const context = buildGrowthContext(state);
  const candidates = continuationCandidates(state, context, eventIndex, traits)
    .concat(lateralCandidates(state, context, eventIndex, traits))
    .concat(renewalCandidates(state, context, eventIndex, traits));

  if (candidates.length === 0) return null;

  const candidatePoints = candidates.map((candidate) => {
    const parent2d = context.projectedById.get(candidate.parent.id);
    const parent3d = context.spatialById.get(candidate.parent.id);
    if (!parent2d || !parent3d) {
      throw new Error(`JE3 candidate ${candidate.parent.id} is missing projection`);
    }
    const end = pointFrom(parent2d.end, candidate.heading, candidate.length);
    const endDepth = parent3d.endDepth + candidate.depthDelta;
    const parentNormalized = normalizedMaturePoint(
      context,
      eventIndex,
      parent2d.end,
      parent3d.endDepth,
    );
    const normalized = normalizedMaturePoint(
      context,
      eventIndex,
      end,
      endDepth,
    );
    return {
      candidate,
      normalized,
      parentNormalized,
      opportunity: matureVolumeOpportunityScore(
        state,
        context,
        eventIndex,
        end,
        endDepth,
      ),
    };
  });

  const terminalTips = context.axisTips
    .map((tip) => context.spatialById.get(tip.id))
    .filter((tip): tip is ProjectedSpatialSegment => Boolean(tip))
    .map((tip) =>
      normalizedMaturePoint(context, eventIndex, tip.end, tip.endDepth),
    );

  const bestImprovements: number[] = [];
  const ATTRACTOR_COUNT = 32;
  const KILL_RADIUS = 0.13;
  for (let index = 0; index < ATTRACTOR_COUNT; index += 1) {
    const attractor = matureAttractor(state.soul, index);
    let currentDistance = Number.POSITIVE_INFINITY;
    for (const tip of terminalTips) {
      currentDistance = Math.min(
        currentDistance,
        normalizedDistance(tip, attractor),
      );
    }
    if (!Number.isFinite(currentDistance)) currentDistance = 2;
    if (currentDistance <= KILL_RADIUS) continue;

    let bestImprovement = 0;
    for (const item of candidatePoints) {
      bestImprovement = Math.max(
        bestImprovement,
        currentDistance - normalizedDistance(item.normalized, attractor),
      );
    }
    bestImprovements.push(Math.max(0, bestImprovement));
  }

  const continuationByParent = new Map<
    string,
    { headings: number[]; depths: number[] }
  >();
  for (const candidate of candidates) {
    if (candidate.relation !== "continuation") continue;
    const group = continuationByParent.get(candidate.parent.id) ?? {
      headings: [],
      depths: [],
    };
    group.headings.push(candidate.heading);
    group.depths.push(candidate.depthDelta);
    continuationByParent.set(candidate.parent.id, group);
  }

  const headingSpans: number[] = [];
  const depthOptions: number[] = [];
  let multipleDepthParents = 0;
  for (const group of continuationByParent.values()) {
    headingSpans.push(
      group.headings.length > 0
        ? Math.max(...group.headings) - Math.min(...group.headings)
        : 0,
    );
    const uniqueDepths = new Set(
      group.depths.map((value) => value.toFixed(9)),
    ).size;
    depthOptions.push(uniqueDepths);
    if (uniqueDepths > 1) multipleDepthParents += 1;
  }

  let projectedInward = 0;
  let radialInward = 0;
  for (const item of candidatePoints) {
    if (
      Math.abs(item.normalized.x) + 1e-9 <
      Math.abs(item.parentNormalized.x)
    ) {
      projectedInward += 1;
    }
    if (
      Math.hypot(item.normalized.x, item.normalized.z) + 1e-9 <
      Math.hypot(item.parentNormalized.x, item.parentNormalized.z)
    ) {
      radialInward += 1;
    }
  }

  const sorted = [...candidates].sort(candidateSort);
  const winner = sorted[0];
  const opportunitySorted = [...candidatePoints].sort(
    (a, b) =>
      b.opportunity - a.opportunity ||
      candidateSort(a.candidate, b.candidate),
  );
  const winnerItem = candidatePoints.find(
    (item) => item.candidate === winner,
  );
  const winnerOpportunityRank =
    opportunitySorted.findIndex((item) => item.candidate === winner) + 1;

  const positiveBest = bestImprovements.filter((value) => value > 1e-9);
  const meaningfulBest = bestImprovements.filter((value) => value > 0.03);
  const mean = (values: readonly number[]): number =>
    values.length > 0
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : 0;

  return {
    eventIndex,
    legalCandidates: candidates.length,
    distinctParents: new Set(candidates.map((candidate) => candidate.parent.id)).size,
    continuationCandidates: candidates.filter(
      (candidate) => candidate.relation === "continuation",
    ).length,
    lateralCandidates: candidates.filter(
      (candidate) => candidate.relation === "lateral",
    ).length,
    renewalCandidates: candidates.filter(
      (candidate) => candidate.relation === "renewal",
    ).length,
    continuationParents: continuationByParent.size,
    meanContinuationHeadingSpan: mean(headingSpans),
    maxContinuationHeadingSpan:
      headingSpans.length > 0 ? Math.max(...headingSpans) : 0,
    meanContinuationDepthOptions: mean(depthOptions),
    continuationParentsWithMultipleDepthOptions: multipleDepthParents,
    projectedInwardCandidateFraction: projectedInward / candidates.length,
    radialInwardCandidateFraction: radialInward / candidates.length,
    uncolonizedAttractors: bestImprovements.length,
    improvableAttractors: positiveBest.length,
    meaningfulImprovableAttractors: meaningfulBest.length,
    improvableAttractorFraction:
      bestImprovements.length > 0 ? positiveBest.length / bestImprovements.length : 0,
    meaningfulImprovableAttractorFraction:
      bestImprovements.length > 0 ? meaningfulBest.length / bestImprovements.length : 0,
    meanBestAttractorImprovement: mean(bestImprovements),
    maxBestAttractorImprovement:
      bestImprovements.length > 0 ? Math.max(...bestImprovements) : 0,
    candidatesWithPositiveOpportunity: candidatePoints.filter(
      (item) => item.opportunity > 1e-9,
    ).length,
    bestOpportunityScore: opportunitySorted[0]?.opportunity ?? 0,
    winnerOpportunityScore: winnerItem?.opportunity ?? 0,
    winnerOpportunityRank,
    winnerIsBestOpportunity: winnerOpportunityRank === 1,
    winnerParentId: winner.parent.id,
    winnerRelation: winner.relation,
    winnerScore: winner.score,
  };
}

export function growStructuralEvent(
  state: TreeState,
  eventIndex: number,
): GrowthModule | null {
  const traits = deriveTreeTraits(state.soul);

  if (state.modules.length === 0) {
    return initialModule(state, eventIndex, traits);
  }
  if (!shouldGrowStructure(eventIndex)) return null;

  const context = buildGrowthContext(state);
  let candidates = continuationCandidates(state, context, eventIndex, traits);

  if (eventIndex > 5) {
    candidates = candidates.concat(
      lateralCandidates(state, context, eventIndex, traits),
    );
    if (eventIndex > MATURE_STRUCTURE_HORIZON) {
      candidates = candidates.concat(
        renewalCandidates(state, context, eventIndex, traits),
      );
    }
  } else {
    candidates = candidates.filter(
      (candidate) =>
        candidate.relation === "continuation" &&
        candidate.parent.axisId === TRUNK_AXIS,
    );
  }

  candidates.sort(
    (a, b) =>
      b.score - a.score ||
      a.order - b.order ||
      compareStableStrings(a.parent.id, b.parent.id) ||
      a.heading - b.heading ||
      a.depthDelta - b.depthDelta,
  );

  const winner = candidates[0];
  if (!winner) return null;

  const parentProjection = context.projectedById.get(winner.parent.id);
  if (!parentProjection) return null;

  return {
    id: `m-${eventIndex}`,
    parentId: winner.parent.id,
    axisId: winner.axisId,
    relation: winner.relation,
    order: winner.order,
    bornAtEvent: eventIndex,
    restTurn: winner.heading - parentProjection.heading,
    restLength: winner.length,
    restDepth: winner.depthDelta,
  };
}
