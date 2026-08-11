import { projectTree } from "./geometry";
import { keyedRange } from "./random";
import { pointFrom, segmentToSegmentDistance } from "./spatial";
import { deriveTreeTraits, type TreeTraits } from "./traits";
import type {
  GrowthModule,
  GrowthRelation,
  Point,
  ProjectedSegment,
  TreeState,
} from "./types";

const TRUNK_AXIS = "axis-0";
const MAX_ORDER = 4;
const MIN_LATERAL_AGE = 3;
const MIN_STRUCTURAL_CLEARANCE = 2.0;
const HARD_MATURE_ASPECT = 1.02;

interface Candidate {
  parent: GrowthModule;
  relation: Exclude<GrowthRelation, "origin">;
  axisId: string;
  order: number;
  heading: number;
  length: number;
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
  bounds: Bounds;
  continuationParents: Set<string>;
  lateralParents: Set<string>;
  axisModuleCounts: Map<string, number>;
  axisCountsByOrder: Map<number, number>;
  establishedFiveByOrder: Map<number, number>;
  lateralFromAxisCounts: Map<string, number>;
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
  const moduleById = new Map(state.modules.map((module) => [module.id, module]));
  const continuationParents = new Set<string>();
  const lateralParents = new Set<string>();
  const axisModuleCounts = new Map<string, number>();
  const axisOrderCounts = new Map<number, Map<string, number>>();
  const lateralFromAxisCounts = new Map<string, number>();
  const latestAxisModulePositions = new Map<string, number>();
  const latestLateralFromAxisPositions = new Map<string, number>();
  const latestFirstOrderModuleByAxis = new Map<string, GrowthModule>();
  const axisRootHeadings = new Map<string, number>();

  for (let index = 0; index < state.modules.length; index += 1) {
    const module = state.modules[index];
    const projection = projectedById.get(module.id);

    axisModuleCounts.set(module.axisId, (axisModuleCounts.get(module.axisId) ?? 0) + 1);
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
    .filter((module) => !continuationParents.has(module.id))
    .map((module) => projectedById.get(module.id))
    .filter((segment): segment is ProjectedSegment => Boolean(segment));

  const firstOrderAxisTips = [...latestFirstOrderModuleByAxis.values()]
    .map((module) => projectedById.get(module.id))
    .filter((segment): segment is ProjectedSegment => Boolean(segment));

  return {
    segments,
    projectedById,
    bounds: boundsFor(segments),
    continuationParents,
    lateralParents,
    axisModuleCounts,
    axisCountsByOrder,
    establishedFiveByOrder,
    lateralFromAxisCounts,
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
  if (!parent) return null;

  const start = parent.end;
  const end = pointFrom(start, candidate.heading, candidate.length);

  if (!Number.isFinite(end.x) || !Number.isFinite(end.y) || end.y > 0) {
    return null;
  }
  if (candidate.length <= 0.5) return null;
  if (violatesBroadCrownEnvelope(context.bounds, end, state.modules.length)) {
    return null;
  }

  const clearance = proposedClearance(
    start,
    end,
    candidate.parent.id,
    context.segments,
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
    crownGapScore(state, context, end, candidate.length, traits) +
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
    if (context.continuationParents.has(parent.id)) continue;

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
        },
        traits,
      );
      if (scored) result.push(scored);
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
      a.parent.id.localeCompare(b.parent.id) ||
      a.heading - b.heading,
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
    restDepth: 0,
  };
}
