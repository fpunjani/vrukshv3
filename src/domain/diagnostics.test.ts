import { describe, expect, it } from "vitest";
import { diagnoseTree } from "./diagnostics";
import { applyEntry, createTree, replayEntries } from "./growth";
import { diagnoseMorphology } from "./morphology";
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

function percentile(values: readonly number[], fraction: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 0) return 0;
  const index = Math.min(
    sorted.length - 1,
    Math.floor((sorted.length - 1) * fraction),
  );
  return sorted[index];
}

function distribution(values: readonly number[]) {
  return {
    min: Math.min(...values),
    p10: percentile(values, 0.1),
    median: percentile(values, 0.5),
    p90: percentile(values, 0.9),
    max: Math.max(...values),
  };
}

describe("V3 structural diagnostics", () => {
  it(
    "keeps 128 souls valid, append-only, collision-safe, and crown-forming",
    () => {
      const meanTurns: number[] = [];
      const minTurns: number[] = [];
      const meanEfficiencies: number[] = [];
      const straightestEfficiencies: number[] = [];

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
            const morphology = diagnoseMorphology(state);
            expect(diagnostics.terminalCount, `${soul} @ 100 terminal tips`).toBeGreaterThanOrEqual(2);
            expect(morphology.trunkModules, `${soul} @ 100 trunk modules`).toBeLessThanOrEqual(10);
            expect(morphology.lateralModuleFraction, `${soul} @ 100 lateral fraction`).toBeGreaterThanOrEqual(0.58);
            expect(morphology.strongOrder1Axes, `${soul} @ 100 strong scaffolds`).toBeGreaterThanOrEqual(2);
            expect(morphology.maxOrder1Modules, `${soul} @ 100 scaffold persistence`).toBeGreaterThanOrEqual(6);
            expect(morphology.middleCrownAspect, `${soul} @ 100 middle crown`).toBeGreaterThanOrEqual(0.28);
          }

          if (milestone === 300) {
            const morphology = diagnoseMorphology(state);
            expect(diagnostics.terminalCount, `${soul} @ 300 terminal tips`).toBeGreaterThanOrEqual(5);
            expect(diagnostics.maxOrder, `${soul} @ 300 branch order`).toBeGreaterThanOrEqual(2);
            expect(morphology.lateralModuleFraction, `${soul} @ 300 lateral fraction`).toBeGreaterThanOrEqual(0.76);
            expect(morphology.strongOrder1Axes, `${soul} @ 300 strong scaffolds`).toBeGreaterThanOrEqual(2);
            expect(morphology.maxOrder1Modules, `${soul} @ 300 scaffold persistence`).toBeGreaterThanOrEqual(6);
            expect(morphology.middleCrownAspect, `${soul} @ 300 middle crown`).toBeGreaterThanOrEqual(0.42);
          }

          if (milestone === 1000) {
            const morphology = diagnoseMorphology(state);
            expect(diagnostics.terminalCount, `${soul} @ 1000 terminal tips`).toBeGreaterThanOrEqual(8);
            expect(diagnostics.maxOrder, `${soul} @ 1000 branch order`).toBeGreaterThanOrEqual(3);
            expect(diagnostics.aspectRatio, `${soul} @ 1000 aspect`).toBeGreaterThanOrEqual(0.25);
            expect(diagnostics.aspectRatio, `${soul} @ 1000 aspect`).toBeLessThanOrEqual(1.05);
            expect(morphology.lateralModuleFraction, `${soul} @ 1000 lateral fraction`).toBeGreaterThanOrEqual(0.88);
            expect(morphology.strongOrder1Axes, `${soul} @ 1000 strong scaffolds`).toBeGreaterThanOrEqual(2);
            expect(morphology.maxOrder1Modules, `${soul} @ 1000 scaffold persistence`).toBeGreaterThanOrEqual(7);
            expect(morphology.middleCrownAspect, `${soul} @ 1000 middle crown`).toBeGreaterThanOrEqual(0.42);

            meanTurns.push(morphology.strongOrder1MeanTurn);
            minTurns.push(morphology.strongOrder1MinTurn);
            meanEfficiencies.push(morphology.strongOrder1MeanPathEfficiency);
            straightestEfficiencies.push(morphology.strongOrder1MaxPathEfficiency);
          }

          if (previous) {
            expect(state.modules.slice(0, previous.modules.length)).toEqual(previous.modules);
            expect(state.leaves.slice(0, previous.leaves.length)).toEqual(previous.leaves);
          }
          previous = state;
        }
      }

      console.log(
        "MECHANICS_128",
        JSON.stringify({
          meanTurns: distribution(meanTurns),
          minTurns: distribution(minTurns),
          meanEfficiencies: distribution(meanEfficiencies),
          straightestEfficiencies: distribution(straightestEfficiencies),
        }),
      );
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
