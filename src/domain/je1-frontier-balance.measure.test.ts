import { describe, it } from "vitest";
import { replayEntries } from "./growth";
import { deriveScaffoldBalancedMeristemFrontier } from "./mature-meristem-frontier";
import type { Entry, TreeState } from "./types";

const ENABLED = import.meta.env.VITE_JE1_FRONTIER_BALANCE_MEASURE === "1";
const suite = ENABLED ? describe : describe.skip;

function entries(count: number): Entry[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `je1-frontier-${index + 1}`,
    text: `JE1 frontier ${index + 1}`,
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

function report(state: TreeState) {
  const frontier = deriveScaffoldBalancedMeristemFrontier(state.modules);
  const selectedByScaffold = Object.fromEntries(
    frontier.acceptedScaffoldAxes.map((axis) => [
      axis,
      frontier.selectedByScaffold.get(axis)?.length ?? 0,
    ]),
  );
  const livingByScaffold = Object.fromEntries(
    frontier.acceptedScaffoldAxes.map((axis) => [
      axis,
      frontier.livingByScaffold.get(axis)?.length ?? 0,
    ]),
  );
  const counts = frontier.acceptedScaffoldAxes.map(
    (axis) => frontier.selectedByScaffold.get(axis)?.length ?? 0,
  );
  const represented = counts.filter((count) => count > 0).length;
  const scaffoldTotal = counts.reduce((sum, count) => sum + count, 0);
  const max = Math.max(0, ...counts);

  return {
    growthIndex: state.growthIndex,
    modules: state.modules.length,
    scaffoldCount: frontier.acceptedScaffoldAxes.length,
    livingTips: frontier.livingTipIds.size,
    recentTips: frontier.recentTipIds.size,
    reserveTipsAdded: frontier.reserveTipIds.size,
    selectedTips: frontier.selectedTipIds.size,
    representedScaffolds: represented,
    scaffoldCoverage:
      frontier.acceptedScaffoldAxes.length > 0
        ? represented / frontier.acceptedScaffoldAxes.length
        : 0,
    largestSelectedScaffoldShare:
      scaffoldTotal > 0 ? max / scaffoldTotal : 0,
    livingByScaffold,
    selectedByScaffold,
  };
}

suite("JE1 generated scaffold-balanced frontier", () => {
  it(
    "measures the generated organism at 3k/10k/30k",
    () => {
      for (const soul of ["ash-01", "ash-02", "ash-03", "ash-04"]) {
        const finalState = replayEntries(soul, entries(30000));
        for (const milestone of [3000, 10000, 30000]) {
          const state =
            milestone === 30000 ? finalState : prefix(finalState, milestone);
          console.log(
            `JE1_FRONTIER_METRIC ${JSON.stringify({ soul, milestone, ...report(state) })}`,
          );
        }
      }
    },
    600_000,
  );
});
