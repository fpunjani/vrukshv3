import { keyedRange } from "./random";
import type {
  GrowthModule,
  LeafAttachment,
  LeafIdentity,
  LeafSide,
  TreeState,
} from "./types";

interface AttachmentCandidate extends LeafAttachment {
  score: number;
}

function childCounts(modules: readonly GrowthModule[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const module of modules) {
    if (!module.parentId) continue;
    counts.set(module.parentId, (counts.get(module.parentId) ?? 0) + 1);
  }
  return counts;
}

function moduleLoads(leaves: readonly LeafIdentity[]): Map<string, number> {
  const loads = new Map<string, number>();
  for (const leaf of leaves) {
    loads.set(
      leaf.attachment.moduleId,
      (loads.get(leaf.attachment.moduleId) ?? 0) + 1,
    );
  }
  return loads;
}

function axisLoads(
  modules: readonly GrowthModule[],
  leaves: readonly LeafIdentity[],
): Map<string, number> {
  const moduleById = new Map(modules.map((module) => [module.id, module]));
  const loads = new Map<string, number>();

  for (const leaf of leaves) {
    const axisId = moduleById.get(leaf.attachment.moduleId)?.axisId;
    if (!axisId) continue;
    loads.set(axisId, (loads.get(axisId) ?? 0) + 1);
  }

  return loads;
}

function orderPreference(order: number): number {
  if (order === 0) return -0.75;
  if (order === 1) return 0.15;
  if (order === 2) return 0.7;
  if (order === 3) return 1.0;
  return 0.8;
}

function candidatePositions(
  soul: string,
  entryId: string,
  moduleId: string,
): readonly number[] {
  const bases = [0.24, 0.42, 0.6, 0.78, 0.9] as const;
  return bases.map((base, index) =>
    Math.max(
      0.16,
      Math.min(
        0.94,
        base +
          keyedRange(
            soul,
            `foliage:${entryId}:${moduleId}:anchor:${index}`,
            -0.035,
            0.035,
          ),
      ),
    ),
  );
}

function localSpacingScore(
  moduleId: string,
  position: number,
  side: LeafSide,
  leaves: readonly LeafIdentity[],
): number {
  let score = 0.45;
  let nearest = Number.POSITIVE_INFINITY;

  for (const leaf of leaves) {
    if (leaf.attachment.moduleId !== moduleId) continue;
    const distance = Math.abs(leaf.attachment.position - position);
    nearest = Math.min(nearest, distance);

    if (distance < 0.06 && leaf.attachment.side === side) score -= 1.5;
    else if (distance < 0.11 && leaf.attachment.side === side) score -= 0.65;
    else if (distance < 0.08) score -= 0.25;
  }

  if (Number.isFinite(nearest)) {
    score += Math.min(0.55, nearest * 2.6);
  }

  return score;
}

function hostScore(
  state: TreeState,
  modules: readonly GrowthModule[],
  module: GrowthModule,
  eventIndex: number,
  entryId: string,
  children: ReadonlyMap<string, number>,
  loads: ReadonlyMap<string, number>,
  loadsByAxis: ReadonlyMap<string, number>,
): number {
  const age = Math.max(0, eventIndex - module.bornAtEvent);
  const load = loads.get(module.id) ?? 0;
  const axisLoad = loadsByAxis.get(module.axisId) ?? 0;
  const terminalBonus = (children.get(module.id) ?? 0) === 0 ? 0.85 : 0;
  const newbornBonus = module.bornAtEvent === eventIndex ? 1.35 : 0;
  const recentBonus = 0.75 / (1 + age / 28);
  const loadPenalty = Math.log2(load + 1) * 0.72;
  const axisLoadPenalty = Math.log2(axisLoad + 1) * 0.12;
  const jitter = keyedRange(
    state.soul,
    `foliage:${entryId}:${module.id}:host-jitter`,
    -0.12,
    0.12,
  );

  return (
    orderPreference(module.order) +
    terminalBonus +
    newbornBonus +
    recentBonus -
    loadPenalty -
    axisLoadPenalty +
    jitter
  );
}

export function chooseLeafAttachment(
  state: TreeState,
  modules: readonly GrowthModule[],
  eventIndex: number,
  entryId: string,
): LeafAttachment {
  if (modules.length === 0) {
    throw new Error("Cannot attach foliage before structural wood exists");
  }

  const children = childCounts(modules);
  const loads = moduleLoads(state.leaves);
  const loadsByAxis = axisLoads(modules, state.leaves);
  let best: AttachmentCandidate | undefined;

  for (const module of modules) {
    if (module.bornAtEvent > eventIndex) continue;

    const baseScore = hostScore(
      state,
      modules,
      module,
      eventIndex,
      entryId,
      children,
      loads,
      loadsByAxis,
    );

    for (const position of candidatePositions(state.soul, entryId, module.id)) {
      for (const side of [-1, 1] as const) {
        const sideJitter = keyedRange(
          state.soul,
          `foliage:${entryId}:${module.id}:${position.toFixed(4)}:${side}:side-jitter`,
          -0.035,
          0.035,
        );
        const score =
          baseScore +
          localSpacingScore(module.id, position, side, state.leaves) +
          sideJitter;

        const candidate: AttachmentCandidate = {
          moduleId: module.id,
          position,
          side,
          score,
        };

        if (
          !best ||
          candidate.score > best.score ||
          (candidate.score === best.score &&
            `${candidate.moduleId}:${candidate.position}:${candidate.side}` <
              `${best.moduleId}:${best.position}:${best.side}`)
        ) {
          best = candidate;
        }
      }
    }
  }

  if (!best) {
    throw new Error(`No eligible foliage host for event ${eventIndex}`);
  }

  return {
    moduleId: best.moduleId,
    position: best.position,
    side: best.side,
  };
}
