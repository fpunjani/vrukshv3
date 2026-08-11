import { keyedRange } from "./random";
import type {
  GrowthModule,
  LeafAttachment,
  LeafIdentity,
  LeafSide,
  TreeState,
} from "./types";

interface FoliageContext {
  children: Map<string, number>;
  moduleLoads: Map<string, number>;
  axisLoads: Map<string, number>;
}

function buildFoliageContext(
  modules: readonly GrowthModule[],
  leaves: readonly LeafIdentity[],
): FoliageContext {
  const children = new Map<string, number>();
  const moduleLoads = new Map<string, number>();
  const axisLoads = new Map<string, number>();
  const moduleById = new Map(modules.map((module) => [module.id, module]));

  for (const module of modules) {
    if (!module.parentId) continue;
    children.set(module.parentId, (children.get(module.parentId) ?? 0) + 1);
  }

  for (const leaf of leaves) {
    const moduleId = leaf.attachment.moduleId;
    moduleLoads.set(moduleId, (moduleLoads.get(moduleId) ?? 0) + 1);
    const axisId = moduleById.get(moduleId)?.axisId;
    if (axisId) {
      axisLoads.set(axisId, (axisLoads.get(axisId) ?? 0) + 1);
    }
  }

  return { children, moduleLoads, axisLoads };
}

function orderPreference(order: number): number {
  if (order === 0) return -0.75;
  if (order === 1) return 0.15;
  if (order === 2) return 0.7;
  if (order === 3) return 1.0;
  return 0.82;
}

function hostScore(
  state: TreeState,
  context: FoliageContext,
  module: GrowthModule,
  eventIndex: number,
  entryId: string,
): number {
  const age = Math.max(0, eventIndex - module.bornAtEvent);
  const moduleLoad = context.moduleLoads.get(module.id) ?? 0;
  const axisLoad = context.axisLoads.get(module.axisId) ?? 0;
  const terminalBonus = (context.children.get(module.id) ?? 0) === 0 ? 0.82 : 0;
  const newbornBonus = module.bornAtEvent === eventIndex ? 1.28 : 0;
  const recentBonus = 0.72 / (1 + age / 28);
  const moduleLoadPenalty = Math.log2(moduleLoad + 1) * 0.78;
  const axisLoadPenalty = Math.log2(axisLoad + 1) * 0.13;
  const jitter = keyedRange(
    state.soul,
    `foliage:${entryId}:${module.id}:host`,
    -0.12,
    0.12,
  );

  return (
    orderPreference(module.order) +
    terminalBonus +
    newbornBonus +
    recentBonus -
    moduleLoadPenalty -
    axisLoadPenalty +
    jitter
  );
}

function fractionalPart(value: number): number {
  return value - Math.floor(value);
}

function localAttachment(
  soul: string,
  entryId: string,
  moduleId: string,
  existingLoad: number,
): Pick<LeafAttachment, "position" | "side"> {
  // A low-discrepancy sequence distributes historical anchors without repacking
  // earlier foliage or imposing a finite per-module slot count.
  const phase = keyedRange(
    soul,
    `foliage:${moduleId}:anchor-phase`,
    0,
    1,
  );
  const goldenStep = 0.6180339887498949;
  const unit = fractionalPart(phase + existingLoad * goldenStep);
  const position = 0.18 + unit * 0.74;
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

  const context = buildFoliageContext(modules, state.leaves);
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

  const local = localAttachment(
    state.soul,
    entryId,
    host.id,
    context.moduleLoads.get(host.id) ?? 0,
  );

  return {
    moduleId: host.id,
    position: local.position,
    side: local.side,
  };
}
