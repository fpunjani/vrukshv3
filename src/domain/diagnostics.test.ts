import { describe, expect, it } from "vitest";
import { diagnoseTree } from "./diagnostics";
import { applyEntry, createTree, replayEntries } from "./growth";
import type { Entry, TreeState } from "./types";

const MILESTONES = new Set([1, 3, 10, 30, 100, 300, 1000]);
const HISTORY: Entry[] = Array.from({ length: 1000 }, (_, index) => ({
  id: `e-${index + 1}`,
  text: `Entry ${index + 1}`,
  createdAt: index,
  status: "open" as const,
}));

function milestoneStates(soul: string): Map<number, TreeState> {
  const snapshots = new Map<number, TreeState>();
  let state = createTree(soul);

  for (const entry of HISTORY) {
    state = applyEntry(state, entry);
    if (MILESTONES.has(state.growthIndex)) snapshots.set(state.growthIndex, state);
  }

  return snapshots;
}

describe("V3 structural diagnostics", () => {
  it(
    "keeps 128 souls valid, crossing-free, append-only, and structurally developed",
    () => {
      for (let soulIndex = 0; soulIndex < 128; soulIndex += 1) {
        const soul = `diagnostic-soul-${soulIndex}`;
        const snapshots = milestoneStates(soul);
        let previous: TreeState | undefined;

        for (const milestone of MILESTONES) {
          const state = snapshots.get(milestone);
          expect(state, `${soul} @ ${milestone}`).toBeDefined();
          if (!state) continue;

          const diagnostics = diagnoseTree(state);
          expect(diagnostics.invariantErrors, `${soul} @ ${milestone}`).toEqual([]);
          expect(diagnostics.crossings, `${soul} @ ${milestone} crossings`).toBe(0);
          expect(diagnostics.belowGroundCount, `${soul} @ ${milestone} below ground`).toBe(0);
          expect(diagnostics.maxChildren, `${soul} @ ${milestone} child count`).toBeLessThanOrEqual(2);
          expect(Number.isFinite(diagnostics.width)).toBe(true);
          expect(Number.isFinite(diagnostics.height)).toBe(true);
          expect(Number.isFinite(diagnostics.aspectRatio)).toBe(true);

          if (milestone === 100) {
            expect(diagnostics.terminalCount, `${soul} @ 100 terminal tips`).toBeGreaterThanOrEqual(2);
          }

          if (milestone === 300) {
            expect(diagnostics.terminalCount, `${soul} @ 300 terminal tips`).toBeGreaterThanOrEqual(5);
            expect(diagnostics.maxOrder, `${soul} @ 300 branch order`).toBeGreaterThanOrEqual(2);
          }

          if (milestone === 1000) {
            expect(diagnostics.terminalCount, `${soul} @ 1000 terminal tips`).toBeGreaterThanOrEqual(8);
            expect(diagnostics.maxOrder, `${soul} @ 1000 branch order`).toBeGreaterThanOrEqual(3);
            expect(diagnostics.aspectRatio, `${soul} @ 1000 aspect`).toBeGreaterThanOrEqual(0.25);
            expect(diagnostics.aspectRatio, `${soul} @ 1000 aspect`).toBeLessThanOrEqual(1.05);
          }

          if (previous) {
            expect(state.modules.slice(0, previous.modules.length)).toEqual(previous.modules);
            expect(state.leaves.slice(0, previous.leaves.length)).toEqual(previous.leaves);
          }
          previous = state;
        }
      }
    },
    30_000,
  );

  it("maintains useful structural growth at a mature history", () => {
    const diagnostics = diagnoseTree(replayEntries("diagnostic-soul", HISTORY));
    expect(diagnostics.moduleCount).toBeGreaterThan(50);
    expect(diagnostics.moduleCount).toBeLessThan(250);
    expect(diagnostics.terminalCount).toBeGreaterThan(5);
    expect(diagnostics.maxOrder).toBeGreaterThanOrEqual(2);
    expect(diagnostics.crossings).toBe(0);
    expect(diagnostics.belowGroundCount).toBe(0);
    expect(diagnostics.leftRightImbalance).toBeGreaterThanOrEqual(0);
    expect(diagnostics.leftRightImbalance).toBeLessThanOrEqual(1);
  });
});
