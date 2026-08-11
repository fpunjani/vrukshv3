import { compareStableStrings } from "./stable-order";
import type { GrowthModule } from "./types";

export interface MatureMeristemFrontier {
  acceptedScaffoldAxes: readonly string[];
  livingTipIds: ReadonlySet<string>;
  recentTipIds: ReadonlySet<string>;
  reserveTipIds: ReadonlySet<string>;
  selectedTipIds: ReadonlySet<string>;
  livingByScaffold: ReadonlyMap<string, readonly string[]>;
  selectedByScaffold: ReadonlyMap<string, readonly string[]>;
}

function firstOrderScaffoldAxis(
  module: GrowthModule,
  byId: ReadonlyMap<string, GrowthModule>,
  accepted: ReadonlySet<string>,
): string | null {
  let current: GrowthModule | undefined = module;
  while (current && current.order > 1 && current.parentId) {
    current = byId.get(current.parentId);
  }
  if (!current || current.order !== 1) return null;
  return accepted.has(current.axisId) ? current.axisId : null;
}

/**
 * Derive the bounded mature continuation frontier without mutating history.
 *
 * JE1 preserves the existing recent frontier, then supplements only scaffold
 * lineages that have fewer than `reservePerScaffold` recent living meristems.
 * A living meristem is a module with no continuation-or-renewal successor.
 */
export function deriveScaffoldBalancedMeristemFrontier(
  modules: readonly GrowthModule[],
  horizon = 1000,
  recentStructuralWindow = 64,
  reservePerScaffold = 4,
): MatureMeristemFrontier {
  const byId = new Map(modules.map((module) => [module.id, module]));
  const positionById = new Map(
    modules.map((module, index) => [module.id, index] as const),
  );
  const latestAxisPosition = new Map<string, number>();
  const successorParents = new Set<string>();

  for (let index = 0; index < modules.length; index += 1) {
    const module = modules[index];
    latestAxisPosition.set(module.axisId, index);
    if (
      module.parentId &&
      (module.relation === "continuation" || module.relation === "renewal")
    ) {
      successorParents.add(module.parentId);
    }
  }

  const acceptedScaffoldAxes = [
    ...new Set(
      modules
        .filter(
          (module) =>
            module.order === 1 &&
            module.relation === "lateral" &&
            module.bornAtEvent <= horizon,
        )
        .map((module) => module.axisId),
    ),
  ].sort(compareStableStrings);
  const accepted = new Set(acceptedScaffoldAxes);

  const livingTips = modules.filter(
    (module) => module.order > 0 && !successorParents.has(module.id),
  );
  const livingTipIds = new Set(livingTips.map((module) => module.id));

  const recentTipIds = new Set<string>();
  for (const tip of livingTips) {
    const latest = latestAxisPosition.get(tip.axisId);
    if (latest === undefined) continue;
    const structuralGap = modules.length - 1 - latest;
    if (structuralGap <= recentStructuralWindow) {
      recentTipIds.add(tip.id);
    }
  }

  const livingByScaffoldMutable = new Map<string, GrowthModule[]>();
  for (const axis of acceptedScaffoldAxes) {
    livingByScaffoldMutable.set(axis, []);
  }
  for (const tip of livingTips) {
    const axis = firstOrderScaffoldAxis(tip, byId, accepted);
    if (!axis) continue;
    livingByScaffoldMutable.get(axis)?.push(tip);
  }

  for (const tips of livingByScaffoldMutable.values()) {
    tips.sort((a, b) => {
      const aPosition = positionById.get(a.id) ?? -1;
      const bPosition = positionById.get(b.id) ?? -1;
      return bPosition - aPosition || compareStableStrings(a.id, b.id);
    });
  }

  const selectedTipIds = new Set(recentTipIds);
  const reserveTipIds = new Set<string>();
  const floor = Math.max(0, Math.floor(reservePerScaffold));

  for (const axis of acceptedScaffoldAxes) {
    const tips = livingByScaffoldMutable.get(axis) ?? [];
    let selectedOnScaffold = tips.reduce(
      (count, tip) => count + (selectedTipIds.has(tip.id) ? 1 : 0),
      0,
    );

    if (selectedOnScaffold >= floor) continue;
    for (const tip of tips) {
      if (selectedTipIds.has(tip.id)) continue;
      selectedTipIds.add(tip.id);
      reserveTipIds.add(tip.id);
      selectedOnScaffold += 1;
      if (selectedOnScaffold >= floor) break;
    }
  }

  const livingByScaffold = new Map<string, readonly string[]>();
  const selectedByScaffold = new Map<string, readonly string[]>();
  for (const axis of acceptedScaffoldAxes) {
    const tipIds = (livingByScaffoldMutable.get(axis) ?? []).map((tip) => tip.id);
    livingByScaffold.set(axis, tipIds);
    selectedByScaffold.set(
      axis,
      tipIds.filter((id) => selectedTipIds.has(id)),
    );
  }

  return {
    acceptedScaffoldAxes,
    livingTipIds,
    recentTipIds,
    reserveTipIds,
    selectedTipIds,
    livingByScaffold,
    selectedByScaffold,
  };
}
