import { describe, it } from "vitest";
import { replayEntries } from "./growth";
import { compareStableStrings } from "./stable-order";
import type { Entry, GrowthModule, TreeState } from "./types";

const ENABLED = import.meta.env.VITE_JE0_FRONTIER_BALANCE_MEASURE === "1";
const suite = ENABLED ? describe : describe.skip;
const HORIZON = 1000;
const TIP_WINDOW = 64;

function entries(count: number): Entry[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `je0-frontier-${index + 1}`,
    text: `JE0 frontier ${index + 1}`,
    createdAt: index + 1,
    status: "open" as const,
  }));
}

function prefix(state: TreeState, count: number): TreeState {
  return {
    ...state,
    growthIndex: count,
    modules: state.modules.filter((module) => module.bornAtEvent <= count),
    leaves: state.leaves.slice(0, count),
  };
}

function firstOrderRootAxis(
  module: GrowthModule,
  byId: ReadonlyMap<string, GrowthModule>,
): string | null {
  let current: GrowthModule | undefined = module;
  while (current && current.order > 1 && current.parentId) {
    current = byId.get(current.parentId);
  }
  return current?.order === 1 ? current.axisId : null;
}

function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function report(state: TreeState) {
  const byId = new Map(state.modules.map((module) => [module.id, module]));
  const latestAxis = new Map<string, number>();
  const successorParents = new Set<string>();

  for (let index = 0; index < state.modules.length; index += 1) {
    const module = state.modules[index];
    latestAxis.set(module.axisId, index);
    if (
      module.parentId &&
      (module.relation === "continuation" || module.relation === "renewal")
    ) {
      successorParents.add(module.parentId);
    }
  }

  const scaffoldRoots = state.modules.filter(
    (module) =>
      module.order === 1 &&
      module.relation === "lateral" &&
      module.bornAtEvent <= HORIZON,
  );
  const scaffoldAxes = [...new Set(scaffoldRoots.map((module) => module.axisId))]
    .sort(compareStableStrings);

  const livingTips = state.modules.filter(
    (module) => module.order > 0 && !successorParents.has(module.id),
  );
  const eligibleTips = livingTips.filter((module) => {
    const latest = latestAxis.get(module.axisId);
    if (latest === undefined) return false;
    return state.modules.length - 1 - latest <= TIP_WINDOW;
  });

  const livingByScaffold = new Map<string, number>();
  const eligibleByScaffold = new Map<string, number>();
  for (const module of livingTips) {
    const root = firstOrderRootAxis(module, byId);
    if (root && scaffoldAxes.includes(root)) {
      livingByScaffold.set(root, (livingByScaffold.get(root) ?? 0) + 1);
    }
  }
  for (const module of eligibleTips) {
    const root = firstOrderRootAxis(module, byId);
    if (root && scaffoldAxes.includes(root)) {
      eligibleByScaffold.set(root, (eligibleByScaffold.get(root) ?? 0) + 1);
    }
  }

  const eligibleCounts = scaffoldAxes.map((axis) => eligibleByScaffold.get(axis) ?? 0);
  const eligibleTotal = eligibleCounts.reduce((sum, count) => sum + count, 0);
  const representedScaffolds = eligibleCounts.filter((count) => count > 0).length;
  const maxEligible = Math.max(0, ...eligibleCounts);

  const tipDormancy = livingTips
    .map((module) => {
      const latest = latestAxis.get(module.axisId);
      return latest === undefined ? 0 : state.modules.length - 1 - latest;
    })
    .sort((a, b) => a - b);
  const p90Index = Math.max(0, Math.ceil(tipDormancy.length * 0.9) - 1);

  return {
    growthIndex: state.growthIndex,
    modules: state.modules.length,
    scaffoldCount: scaffoldAxes.length,
    livingTips: livingTips.length,
    eligibleTips: eligibleTips.length,
    representedScaffolds,
    scaffoldCoverage:
      scaffoldAxes.length > 0 ? representedScaffolds / scaffoldAxes.length : 0,
    largestEligibleScaffoldShare:
      eligibleTotal > 0 ? maxEligible / eligibleTotal : 0,
    medianEligibleTipsPerScaffold: median(eligibleCounts),
    terminalDormancyP90: tipDormancy[p90Index] ?? 0,
    livingByScaffold: Object.fromEntries(
      scaffoldAxes.map((axis) => [axis, livingByScaffold.get(axis) ?? 0]),
    ),
    eligibleByScaffold: Object.fromEntries(
      scaffoldAxes.map((axis) => [axis, eligibleByScaffold.get(axis) ?? 0]),
    ),
  };
}

suite("JE0 corrected scaffold frontier balance", () => {
  it(
    "measures living scaffold meristems under the unchanged global 64-birth window",
    () => {
      for (const soul of ["ash-01", "ash-02", "ash-03", "ash-04"]) {
        const finalState = replayEntries(soul, entries(30000));
        for (const milestone of [3000, 10000, 30000]) {
          const state =
            milestone === 30000 ? finalState : prefix(finalState, milestone);
          console.log(
            `JE0_FRONTIER_METRIC ${JSON.stringify({ soul, milestone, ...report(state) })}`,
          );
        }
      }
    },
    600_000,
  );
});
