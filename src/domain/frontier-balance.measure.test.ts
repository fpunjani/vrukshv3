import { describe, it } from "vitest";
import { replayEntries } from "./growth";
import type { Entry, GrowthModule, TreeState } from "./types";

const ENABLED = import.meta.env.VITE_FRONTIER_BALANCE_MEASURE === "1";
const suite = ENABLED ? describe : describe.skip;
const HORIZON = 1000;
const TIP_WINDOW = 64;

function entries(count: number): Entry[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `frontier-balance-${index + 1}`,
    text: `Frontier balance ${index + 1}`,
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

function report(state: TreeState) {
  const byId = new Map(state.modules.map((module) => [module.id, module]));
  const position = new Map(state.modules.map((module, index) => [module.id, index]));
  const latestAxis = new Map<string, number>();
  const continuationParents = new Set<string>();

  for (let index = 0; index < state.modules.length; index += 1) {
    const module = state.modules[index];
    latestAxis.set(module.axisId, index);
    if (module.parentId && module.relation === "continuation") {
      continuationParents.add(module.parentId);
    }
  }

  const scaffoldRoots = state.modules.filter(
    (module) =>
      module.order === 1 &&
      module.relation === "lateral" &&
      module.bornAtEvent <= HORIZON,
  );
  const scaffoldAxes = new Set(scaffoldRoots.map((module) => module.axisId));

  const terminalModules = state.modules.filter(
    (module) => module.order > 0 && !continuationParents.has(module.id),
  );
  const eligibleTips = terminalModules.filter((module) => {
    const latest = latestAxis.get(module.axisId);
    if (latest === undefined) return false;
    return state.modules.length - 1 - latest <= TIP_WINDOW;
  });

  const terminalByScaffold = new Map<string, number>();
  const eligibleByScaffold = new Map<string, number>();
  for (const module of terminalModules) {
    const root = firstOrderRootAxis(module, byId);
    if (root && scaffoldAxes.has(root)) {
      terminalByScaffold.set(root, (terminalByScaffold.get(root) ?? 0) + 1);
    }
  }
  for (const module of eligibleTips) {
    const root = firstOrderRootAxis(module, byId);
    if (root && scaffoldAxes.has(root)) {
      eligibleByScaffold.set(root, (eligibleByScaffold.get(root) ?? 0) + 1);
    }
  }

  const eligibleCounts = [...eligibleByScaffold.values()];
  const eligibleTotal = eligibleCounts.reduce((sum, count) => sum + count, 0);
  const maxEligible = Math.max(0, ...eligibleCounts);
  const representedScaffolds = [...scaffoldAxes].filter(
    (axis) => (eligibleByScaffold.get(axis) ?? 0) > 0,
  ).length;

  const dormantTerminalGaps = terminalModules
    .map((module) => {
      const latest = latestAxis.get(module.axisId);
      const own = position.get(module.id);
      if (latest === undefined || own === undefined) return 0;
      return state.modules.length - 1 - latest;
    })
    .sort((a, b) => a - b);
  const p90Index = Math.max(
    0,
    Math.ceil(dormantTerminalGaps.length * 0.9) - 1,
  );

  return {
    modules: state.modules.length,
    scaffoldCount: scaffoldAxes.size,
    terminalTips: terminalModules.length,
    eligibleTips: eligibleTips.length,
    representedScaffolds,
    scaffoldCoverage:
      scaffoldAxes.size > 0 ? representedScaffolds / scaffoldAxes.size : 0,
    largestEligibleScaffoldShare:
      eligibleTotal > 0 ? maxEligible / eligibleTotal : 0,
    medianEligibleTipsPerRepresentedScaffold:
      eligibleCounts.length > 0
        ? [...eligibleCounts].sort((a, b) => a - b)[
            Math.floor(eligibleCounts.length / 2)
          ]
        : 0,
    terminalDormancyP90: dormantTerminalGaps[p90Index] ?? 0,
    terminalByScaffold: Object.fromEntries(
      [...terminalByScaffold.entries()].sort(([a], [b]) => a.localeCompare(b)),
    ),
    eligibleByScaffold: Object.fromEntries(
      [...eligibleByScaffold.entries()].sort(([a], [b]) => a.localeCompare(b)),
    ),
  };
}

suite("mature scaffold frontier balance", () => {
  it(
    "measures whether the recency frontier abandons established scaffold systems",
    () => {
      const souls = ["ash-01", "ash-02", "ash-03", "ash-04"];
      for (const soul of souls) {
        const final = replayEntries(soul, entries(30000));
        for (const milestone of [3000, 10000, 30000]) {
          console.log(
            "FRONTIER_BALANCE_METRIC",
            JSON.stringify({ soul, milestone, ...report(prefix(final, milestone)) }),
          );
        }
      }
    },
    180_000,
  );
});
