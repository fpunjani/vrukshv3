import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { replayEntries } from "./growth";
import { diagnoseMorphology } from "./morphology";
import type { Entry } from "./types";

const HISTORY: Entry[] = Array.from({ length: 1000 }, (_, index) => ({
  id: `e-${index + 1}`,
  text: `Entry ${index + 1}`,
  createdAt: index,
  status: "open" as const,
}));

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

describe("temporary V3 mechanics measurement", () => {
  it(
    "writes the mature 128-soul scaffold mechanics distribution",
    () => {
      const meanTurns: number[] = [];
      const minTurns: number[] = [];
      const meanEfficiencies: number[] = [];
      const straightestEfficiencies: number[] = [];

      for (let index = 0; index < 128; index += 1) {
        const state = replayEntries(`diagnostic-soul-${index}`, HISTORY);
        const morphology = diagnoseMorphology(state);
        meanTurns.push(morphology.strongOrder1MeanTurn);
        minTurns.push(morphology.strongOrder1MinTurn);
        meanEfficiencies.push(morphology.strongOrder1MeanPathEfficiency);
        straightestEfficiencies.push(morphology.strongOrder1MaxPathEfficiency);
      }

      const report = {
        generatedFor: "v3-scaffold-crown",
        souls: 128,
        entriesPerSoul: 1000,
        meanTurns: distribution(meanTurns),
        minTurns: distribution(minTurns),
        meanEfficiencies: distribution(meanEfficiencies),
        straightestEfficiencies: distribution(straightestEfficiencies),
      };

      writeFileSync("mechanics-measured.json", `${JSON.stringify(report, null, 2)}\n`);
      expect(meanTurns.every(Number.isFinite)).toBe(true);
      expect(meanEfficiencies.every(Number.isFinite)).toBe(true);
    },
    30_000,
  );
});
