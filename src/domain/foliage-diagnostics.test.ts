import { describe, expect, it } from "vitest";
import { diagnoseFoliage } from "./foliage-diagnostics";
import { applyEntry, createTree } from "./growth";
import type { Entry, TreeState } from "./types";

const MILESTONES = new Set([100, 300, 1000]);
const HISTORY: Entry[] = Array.from({ length: 1000 }, (_, index) => ({
  id: `entry-${index + 1}`,
  text: `Entry ${index + 1}`,
  createdAt: index,
  status: "open" as const,
}));

function snapshots(soul: string): Map<number, TreeState> {
  const result = new Map<number, TreeState>();
  let state = createTree(soul);

  for (const entry of HISTORY) {
    state = applyEntry(state, entry);
    if (MILESTONES.has(state.growthIndex)) {
      result.set(state.growthIndex, state);
    }
  }

  return result;
}

describe("V3 foliage distribution diagnostics", () => {
  it(
    "avoids pathological concentration across 16 deterministic souls",
    () => {
      for (let soulIndex = 0; soulIndex < 16; soulIndex += 1) {
        const soul = `foliage-diagnostic-${soulIndex}`;
        const states = snapshots(soul);

        for (const milestone of MILESTONES) {
          const state = states.get(milestone);
          expect(state, `${soul} @ ${milestone}`).toBeDefined();
          if (!state) continue;

          const diagnostics = diagnoseFoliage(state);
          expect(diagnostics.totalLeaves, `${soul} @ ${milestone} identities`).toBe(milestone);
          expect(diagnostics.occupiedModuleFraction, `${soul} @ ${milestone} occupied modules`).toBeGreaterThanOrEqual(0.35);
          expect(diagnostics.occupiedAxisFraction, `${soul} @ ${milestone} occupied axes`).toBeGreaterThanOrEqual(0.35);

          // Concentration limits tighten as the crown gains enough modules and
          // axes for stronger distribution to be biologically/visually meaningful.
          const moduleConcentrationLimit =
            milestone === 100 ? 0.15 : milestone === 300 ? 0.13 : 0.12;
          const axisConcentrationLimit = milestone === 100 ? 0.55 : 0.45;
          expect(diagnostics.maxModuleLoadFraction, `${soul} @ ${milestone} module concentration`).toBeLessThanOrEqual(moduleConcentrationLimit);
          expect(diagnostics.maxAxisLoadFraction, `${soul} @ ${milestone} axis concentration`).toBeLessThanOrEqual(axisConcentrationLimit);

          expect(diagnostics.trunkLeafFraction, `${soul} @ ${milestone} trunk concentration`).toBeLessThanOrEqual(0.28);
          expect(diagnostics.leftRightImbalance, `${soul} @ ${milestone} side imbalance`).toBeLessThanOrEqual(0.4);
          expect(Number.isFinite(diagnostics.meanHostAgeAtAttachment)).toBe(true);
        }
      }
    },
    20_000,
  );
});
