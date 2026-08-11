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

function structuralInterval(eventIndex: number): number {
  return Math.min(12, 2 + Math.floor(Math.log2(eventIndex + 1)));
}

export function shouldGrowStructure(eventIndex: number): boolean {
  return eventIndex <= 14 || eventIndex % structuralInterval(eventIndex) === 0;
}

function hasChild(
  state: TreeState,
  parentId: string,
  relation: Exclude<GrowthRelation, "origin">,
): boolean {
  return state.modules.some(
    (module) => module.parentId === parentId && module.relation === relation,
  );
}

function moduleById(state: TreeState): Map<string, GrowthModule> {
  return new Map(state.modules.map((module) => [module.id, module]));
}

function axisModuleCount(state: TreeState, axisId: string): number {
  let count = 0;
  for (const module of state.modules) {
    if (module.axisId === axisId) count += 1;
  }
  return count;
}

function axesOfOrder(state: TreeState, order: number): Map<string, number> {
  const counts = new Map<string, number>();
  for (const module of state.modules) {
    if (module.order !== order) continue;
    counts.set(module.axisId, (counts.get(module.axisId) ?? 0) + 1);
  }
  return counts;
}

function establishedAxisCount(
  state: TreeState,
  order: number,
  minimumModules: number,
): number {
  return [...axesOfOrder(state, order).values()].filter(
    (count) => count >= minimumModules,
  ).length;
}

function lateralFromAxisCount(state: TreeState, axisId: string): number {
  const byId = moduleById(state);
  let count = 0;
  for (const module of state.modules) {
    if (module.relation !== "lateral" || !module.parentId) continue;
    if (byId.get(module.parentId)?.axisId === axisId) count += 1;
  }
  return count;
}

function latestAxisModulePosition(state: TreeState, axisId: string): number {
  for (let index = state.modules.length - 1; index >= 0; index -= 1) {
    if (state.modules[index].axisId === axisId) return index;
  }
  return -1;
}

function latestLateralFromAxisPosition(state: TreeState, axisId: string): number {
  const byId = moduleById(state);
  for (let index = state.modules.length - 1; index >= 0; index -= 1) {
    const module = state.modules[index];
    if (module.relation !== "lateral" || !module.parentId) continue;
    if (byId.get(module.parentId)?.axisId === axisId) return index;
  }
  return -1;
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
  if (order === 1) return 5;
  if (order === 2) return 3;
  return 3;
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

function lengthRange(order: number): readonly [number, number] {
  if (order <= 0) return [16, 21];
  if (order === 1) return [13, 18];
  if (order === 2) return [10, 15];
  if (order === 3) return [7.5, 12];
  return [5.5, 9];
}

function candidateLength(
  state: TreeState,
  eventIndex: number,
  parent: GrowthModule,
  relation: Exclude<GrowthRelation, "origin">,
  order: number,
  traits: TreeTraits,
): number {
  const [min, max] = lengthRange(order);
  let scale = relation === "continuation" ? 1 : 0.94;

  if (relation === "continuation" && order === 0) {
    const axisModules = axisModuleCount(state, parent.axisId);
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
  const softMaximumAspect = Math.min(
    0.98,
    traits.crownAspect * 1.14 + 0.08,
  );
  const overspread = Math.max(0, aspect - softMaximumAspect);

  const centre = (next.minX + next.maxX) / 2;
  const targetCentre =
    Math.tan((traits.lean * Math.PI) / 180) * height * 0.3;
  const centreError = Math.abs(centre - targetCentre) / Math.max(30, height);

  return -aspectError * 0.65 - overspread * 2.6 - centreError * 0.55;
}

function axisTipSegments(
  state: TreeState,
  projectedById: ReadonlyMap<string, ProjectedSegment>,
): ProjectedSegment[] {
  const continued = new Set(
    state.modules
      .filter((module) => module.relation === "continuation" && module.parentId)
      .map((module) => module.parentId as string),
  );
  return state.modules
    .filter((module) => !continued.has(module.id))
    .map((module) => projectedById.get(module.id))
    .filter((segment): segment is ProjectedSegment => Boolean(segment));
}

function crownGapScore(
  state: TreeState,
  proposedEnd: Point,
  candidateLengthValue: number,
  projectedById: ReadonlyMap<string, ProjectedSegment>,
  bounds: Bounds,
  traits: TreeTraits,
): number {
  if (state.modules.length < 10) return 0;

  const height = Math.max(60, -bounds.minY);
  const proposedHeight = Math.max(0, -proposedEnd.y / height);
  const tips = axisTipSegments(state, projectedById);
  const sameBand = tips.filter((tip) => {
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
  for (const tip of tips) {
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
  state: TreeState,
  proposedEnd: Point,
  projectedById: ReadonlyMap<string, ProjectedSegment>,
  traits: TreeTraits,
): number {
  const axes = new Map<string, GrowthModule[]>();
  for (const module of state.modules) {
    if (module.order !== 1) continue;
    const list = axes.get(module.axisId) ?? [];
    list.push(module);
    axes.set(module.axisId, list);
  }
  if (axes.size === 0) return 0.2;

  let left = 0;
  let right = 0;
  for (const modules of axes.values()) {
    const tip = [...modules].sort(
      (a, b) => b.bornAtEvent - a.bornAtEvent,
    )[0];
    const projection = projectedById.get(tip.id);
    if (!projection) continue;
    const centre =
      Math.tan((traits.lean * Math.PI) / 180) *
      Math.max(20, -projection.end.y) *
      0.25;
    if (projection.end.x < centre) left += 1;
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
  candidate: Omit<Candidate, "score">,
): number {
  const position =
    candidate.relation === "continuation"
      ? latestAxisModulePosition(state, candidate.parent.axisId)
      : latestLateralFromAxisPosition(state, candidate.parent.axisId);
  if (position < 0) return 0;

  const structuralGap = state.modules.length - 1 - position;
  if (structuralGap === 0) return 0.72;
  if (structuralGap === 1) return 0.34;
  return 0;
}

function architectureScore(
  state: TreeState,
  candidate: Omit<Candidate, "score">,
  traits: TreeTraits,
): number {
  const axisModules = axisModuleCount(state, candidate.parent.axisId);
  const preferred = preferredAxisModules(candidate.order, traits);

  if (candidate.relation === "continuation") {
    const deficit = Math.max(0, preferred - axisModules);
    const excess = Math.max(0, axisModules - preferred);

    if (candidate.order === 0) {
      const earlyLeaderBonus = Math.min(0.9, deficit * 0.14);
      const order1Axes = axesOfOrder(state, 1).size;
      const establishedScaffolds = establishedAxisCount(state, 1, 5);
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

  const laterals = lateralFromAxisCount(state, candidate.parent.axisId);
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

function scoreCandidate(
  state: TreeState,
  eventIndex: number,
  candidate: Omit<Candidate, "score">,
  segments: readonly ProjectedSegment[],
  projectedById: ReadonlyMap<string, ProjectedSegment>,
  bounds: Bounds,
  traits: TreeTraits,
): Candidate | null {
  const parent = projectedById.get(candidate.parent.id);
  if (!parent) return null;

  const start = parent.end;
  const end = pointFrom(start, candidate.heading, candidate.length);
  if (!Number.isFinite(end.x) || !Number.isFinite(end.y) || end.y > 0) {
    return null;
  }
  if (candidate.length <= 0.5) return null;
  if (violatesBroadCrownEnvelope(bounds, end, state.modules.length)) {
    return null;
  }

  const clearance = proposedClearance(
    start,
    end,
    candidate.parent.id,
    segments,
  );
  if (clearance < MIN_STRUCTURAL_CLEARANCE) return null;

  const parentAge = state.growthIndex - candidate.parent.bornAtEvent;
  const spaceScore = Math.min(
    1.45,
    clearance / Math.max(4, candidate.length * 0.45),
  );
  const firstOrderSide =
    candidate.relation === "lateral" && candidate.order === 1
      ? firstOrderSideScore(state, end, projectedById, traits)
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
    crownEnvelopeScore(bounds, end, traits, state.modules.length) +
    crownGapScore(
      state,
      end,
      candidate.length,
      projectedById,
      bounds,
      traits,
    ) +
    firstOrderSide +
    architectureScore(state, candidate, traits) -
    structuralRecencyPenalty(state, candidate) +
    jitter;

  return { ...candidate, score };
}

function continuationCandidates(
  state: TreeState,
  eventIndex: number,
  segments: readonly ProjectedSegment[],
  projectedById: ReadonlyMap<string, ProjectedSegment>,
  bounds: Bounds,
  traits: TreeTraits,
): Candidate[] {
  const result: Candidate[] = [];

  for (const parent of state.modules) {
    if (parent.order > MAX_ORDER) continue;
    if (hasChild(state, parent.id, "continuation")) continue;

    const projection = projectedById.get(parent.id);
    if (!projection) continue;

    const targetHeading =
      parent.order === 0 ? traits.lean : projection.heading * 0.985;
    const tropism =
      (targetHeading - projection.heading) *
      (parent.order === 0 ? 0.16 : 0.035);
    const localNoise = keyedRange(
      state.soul,
      `structure:${eventIndex}:${parent.id}:continue:curve`,
      -traits.curvature,
      traits.curvature,
    );
    const baseHeading = projection.heading + tropism + localNoise * 0.3;
    const offsets = [
      -traits.curvature * 0.9,
      0,
      traits.curvature * 0.9,
    ];
    const length = candidateLength(
      state,
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
        eventIndex,
        {
          parent,
          relation: "continuation",
          axisId: parent.axisId,
          order: parent.order,
          heading,
          length,
        },
        segments,
        projectedById,
        bounds,
        traits,
      );
      if (scored) result.push(scored);
    }
  }

  return result;
}

function lateralCandidates(
  state: TreeState,
  eventIndex: number,
  segments: readonly ProjectedSegment[],
  projectedById: ReadonlyMap<string, ProjectedSegment>,
  bounds: Bounds,
  traits: TreeTraits,
): Candidate[] {
  const result: Candidate[] = [];

  for (const parent of state.modules) {
    if (parent.order >= MAX_ORDER) continue;
    if (hasChild(state, parent.id, "lateral")) continue;
    if (!hasChild(state, parent.id, "continuation")) continue;
    if (state.growthIndex - parent.bornAtEvent < MIN_LATERAL_AGE) continue;

    const axisModules = axisModuleCount(state, parent.axisId);
    if (axisModules < minimumAxisModulesBeforeLateral(parent.order, traits)) {
      continue;
    }

    const projection = projectedById.get(parent.id);
    if (!projection) continue;

    const order = parent.order + 1;
    const angleScale = keyedRange(
      state.soul,
      `structure:${eventIndex}:${parent.id}:lateral:angle-scale`,
      0.9,
      1.1,
    );
    const divergence = traits.branchAngle * angleScale;
    const length = candidateLength(
      state,
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
        eventIndex,
        {
          parent,
          relation: "lateral",
          axisId: `axis-${eventIndex}`,
          order,
          heading,
          length,
        },
        segments,
        projectedById,
        bounds,
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

  const segments = projectTree(state);
  const projectedById = new Map(
    segments.map((segment) => [segment.id, segment]),
  );
  const bounds = boundsFor(segments);

  let candidates = continuationCandidates(
    state,
    eventIndex,
    segments,
    projectedById,
    bounds,
    traits,
  );

  if (eventIndex > 5) {
    candidates = candidates.concat(
      lateralCandidates(
        state,
        eventIndex,
        segments,
        projectedById,
        bounds,
        traits,
      ),
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

  const parentProjection = projectedById.get(winner.parent.id);
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
  };
}
