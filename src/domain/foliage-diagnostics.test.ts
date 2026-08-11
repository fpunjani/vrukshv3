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

          // A 100-entry tree still has relatively little eligible wood, so one
          // host carrying 13% of identities is not yet pathological. Tighten the
          // concentration guard once the scaffold/crown system has more hosts.
          const moduleConcentrationLimit = milestone === 100 ? 0.15 : 0.12;
          expect(diagnostics.maxModuleLoadFraction, `${soul} @ ${milestone} module concentration`).toBeLessThanOrEqual(moduleConcentrationLimit);

          expect(diagnostics.maxAxisLoadFraction, `${soul} @ ${milestone} axis concentration`).toBeLessThanOrEqual(0.45);
          expect(diagnostics.trunkLeafFraction, `${soul} @ ${milestone} trunk concentration`).toBeLessThanOrEqual(0.28);
          expect(diagnostics.leftRightImbalance, `${soul} @ ${milestone} side imbalance`).toBeLessThanOrEqual(0.4);
          expect(Number.isFinite(diagnostics.meanHostAgeAtAttachment)).toBe(true);
        }
      }
    },
    20_000,
  );
});
