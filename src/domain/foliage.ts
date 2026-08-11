import { keyedRange } from "./random";
import type {
  GrowthModule,
  LeafAttachment,
  LeafSide,
  TreeState,
} from "./types";

interface FoliageContext {
  children: Map<string, number>;
}

function buildFoliageContext(
  modules: readonly GrowthModule[],
): FoliageContext {
  const children = new Map<string, number>();
  for (const module of modules) {
    if (!module.parentId) continue;
    children.set(module.parentId, (children.get(module.parentId) ?? 0) + 1);
  }
  return { children };
}

function orderPreference(order: number): number {
  if (order === 0) return -0.9;
  if (order === 1) return 0.0;
  if (order === 2) return 0.48;
  if (order === 3) return 0.72;
  return 0.62;
}

function hostScore(
  state: TreeState,
  context: FoliageContext,
  module: GrowthModule,
  eventIndex: number,
  entryId: string,
): number {
  const age = Math.max(0, eventIndex - module.bornAtEvent);
  const terminalBonus = (context.children.get(module.id) ?? 0) === 0 ? 0.36 : 0;
  const newbornBonus = module.bornAtEvent === eventIndex ? 0.58 : 0;
  const recentBonus = 0.34 / (1 + age / 36);

  // Entry-specific rendezvous jitter spreads identities across eligible wood
  // without reading or repacking any prior foliage. That keeps attachment
  // assignment dependent on current wood, not total historical leaf count.
  const rendezvous = keyedRange(
    state.soul,
    `foliage:${entryId}:${module.id}:host`,
    -0.78,
    0.78,
  );

  return (
    orderPreference(module.order) +
    terminalBonus +
    newbornBonus +
    recentBonus +
    rendezvous
  );
}

function localAttachment(
  soul: string,
  entryId: string,
  moduleId: string,
): Pick<LeafAttachment, "position" | "side"> {
  const position = keyedRange(
    soul,
    `foliage:${entryId}:${moduleId}:position`,
    0.18,
    0.92,
  );
  const side: LeafSide =
    keyedRange(
      soul,
      `foliage:${entryId}:${moduleId}:side`,
      -1,
      1,
    ) >= 0
      ? 1
      : -1;

  return { position, side };
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

  const context = buildFoliageContext(modules);
  let host: GrowthModule | undefined;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const module of modules) {
    if (module.bornAtEvent > eventIndex) continue;
    const score = hostScore(state, context, module, eventIndex, entryId);

    if (
      score > bestScore ||
      (score === bestScore && (!host || module.id < host.id))
    ) {
      host = module;
      bestScore = score;
    }
  }

  if (!host) {
    throw new Error(`No eligible foliage host for event ${eventIndex}`);
  }

  const local = localAttachment(state.soul, entryId, host.id);
  return {
    moduleId: host.id,
    position: local.position,
    side: local.side,
  };
}
