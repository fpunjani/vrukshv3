import { describe, expect, it } from "vitest";
import { diagnoseCurvedWood, diagnoseTree } from "./diagnostics";
import { diagnoseFoliage } from "./foliage-diagnostics";
import { applyEntry, replayEntries } from "./growth";
import type { Entry, TreeState } from "./types";

function entry(index: number): Entry {
  return {
    id: `life-${index}`,
    text: `Life entry ${index}`,
    createdAt: index,
    status: "open",
  };
}

const HISTORY: Entry[] = Array.from({ length: 30001 }, (_, index) =>
  entry(index + 1),
);

function historicalPrefix(state: TreeState, entries: number): TreeState {
  return {
    schemaVersion: 2,
    soul: state.soul,
    growthIndex: entries,
    modules: state.modules.filter((module) => module.bornAtEvent <= entries),
    leaves: state.leaves.slice(0, entries),
  };
}

function validateLongHistory(state: TreeState, expectedEntries: number): void {
  expect(state.schemaVersion).toBe(2);
  expect(state.growthIndex).toBe(expectedEntries);
  expect(state.leaves).toHaveLength(expectedEntries);
  expect(new Set(state.leaves.map((leaf) => leaf.entryId)).size).toBe(expectedEntries);

  const moduleById = new Map(state.modules.map((module) => [module.id, module]));
  let invalidHosts = 0;
  for (const leaf of state.leaves) {
    const host = moduleById.get(leaf.attachment.moduleId);
    if (!host || host.bornAtEvent > leaf.bornAtEvent) invalidHosts += 1;
  }
  expect(invalidHosts).toBe(0);

  // Long-life states must preserve the same structural invariants we enforce
  // inside the 0-1000 visual-development horizon. Longevity is not allowed to
  // become a weaker mode just because structural opportunities are sparser.
  const structure = diagnoseTree(state);
  expect(structure.invariantErrors).toEqual([]);
  expect(structure.crossings).toBe(0);
  expect(structure.belowGroundCount).toBe(0);
  expect(structure.maxChildren).toBeLessThanOrEqual(2);
  expect(Number.isFinite(structure.width)).toBe(true);
  expect(Number.isFinite(structure.height)).toBe(true);
  expect(Number.isFinite(structure.aspectRatio)).toBe(true);

  // Wood must keep developing, but entries must never map 1:1 to branches.
  expect(state.modules.length).toBeGreaterThan(50);
  expect(state.modules.length).toBeLessThan(expectedEntries / 4);

  const foliage = diagnoseFoliage(state);
  expect(foliage.totalLeaves).toBe(expectedEntries);
  expect(foliage.maxModuleLoadFraction).toBeLessThan(0.1);
  expect(foliage.maxAxisLoadFraction).toBeLessThan(0.35);
  expect(foliage.trunkLeafFraction).toBeLessThan(0.2);
  expect(foliage.leftRightImbalance).toBeLessThan(0.15);
}

describe("V3 long-life organism", () => {
  it(
    "reconstructs one organism through 30000 entries and appends entry 30001 without rewriting history",
    () => {
      const at30000 = replayEntries("longevity-soul", HISTORY.slice(0, 30000));
      const at3000 = historicalPrefix(at30000, 3000);
      const at10000 = historicalPrefix(at30000, 10000);

      validateLongHistory(at3000, 3000);
      validateLongHistory(at10000, 10000);
      validateLongHistory(at30000, 30000);

      // The rendered mature wood must also remain mechanically coherent at the
      // longevity horizon. Three samples per curve keep this as a broad safety
      // gate rather than turning the long-history test into a rendering benchmark.
      const curved = diagnoseCurvedWood(at30000, 3);
      expect(curved.curveCrossings).toBe(0);
      expect(curved.crowdedPairs).toBe(0);
      expect(curved.belowGroundSamples).toBe(0);
      expect(curved.taperErrors).toBe(0);
      expect(curved.continuationDiameterErrors).toBe(0);
      expect(curved.lateralDiameterErrors).toBe(0);

      expect(at10000.modules.length).toBeGreaterThan(at3000.modules.length);
      expect(at30000.modules.length).toBeGreaterThan(at10000.modules.length);
      expect(at30000.leaves.slice(0, 3000)).toEqual(at3000.leaves);
      expect(at30000.modules.slice(0, at3000.modules.length)).toEqual(at3000.modules);
      expect(at30000.leaves.slice(0, 10000)).toEqual(at10000.leaves);
      expect(at30000.modules.slice(0, at10000.modules.length)).toEqual(at10000.modules);

      const after = applyEntry(at30000, HISTORY[30000]);
      expect(after.growthIndex).toBe(30001);
      expect(after.leaves.slice(0, at30000.leaves.length)).toEqual(at30000.leaves);
      expect(after.modules.slice(0, at30000.modules.length)).toEqual(at30000.modules);
      expect(after.leaves[30000].entryId).toBe("life-30001");
    },
    60_000,
  );
});
