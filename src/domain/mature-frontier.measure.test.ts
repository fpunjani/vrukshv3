import { describe, it } from "vitest";
import { diagnoseMatureFrontier } from "./mature-frontier";
import { replayEntries } from "./growth";
import type { Entry, TreeState } from "./types";

const VISUAL_SOULS = [
  "ash-01",
  "ash-02",
  "ash-03",
  "ash-04",
  "ash-05",
  "ash-06",
  "ash-07",
  "ash-08",
] as const;

function entries(count: number): Entry[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `mature-${index + 1}`,
    text: `Mature measurement ${index + 1}`,
    createdAt: index,
    status: "open" as const,
  }));
}

function historicalPrefix(state: TreeState, count: number): TreeState {
  return {
    ...state,
    growthIndex: count,
    modules: state.modules.filter((module) => module.bornAtEvent <= count),
    leaves: state.leaves.slice(0, count),
  };
}

const measureIt =
  import.meta.env.VITE_MATURE_FRONTIER_MEASURE === "1" ? it : it.skip;

describe("Mature Frontier V1 measurement", () => {
  measureIt(
    "reports current long-life behavior before thresholds or scoring changes",
    () => {
      for (let soulIndex = 0; soulIndex < VISUAL_SOULS.length; soulIndex += 1) {
        const soul = VISUAL_SOULS[soulIndex];
        // Four souls receive the expensive 30k pass; the other four still
        // reach 10k. This is measurement-only and intentionally separate from
        // normal PR CI.
        const target = soulIndex < 4 ? 30000 : 10000;
        const finalState = replayEntries(soul, entries(target));
        const milestones = target === 30000
          ? [1000, 3000, 10000, 30000]
          : [1000, 3000, 10000];

        for (const milestone of milestones) {
          const state =
            milestone === target
              ? finalState
              : historicalPrefix(finalState, milestone);
          const diagnostics = diagnoseMatureFrontier(state);
          console.log(
            `MATURE_FRONTIER_METRIC ${JSON.stringify({
              soul,
              milestone,
              ...diagnostics,
            })}`,
          );
        }
      }
    },
    600_000,
  );
});
