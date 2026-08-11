import { describe, expect, it } from "vitest";
import { diagnoseFoliage } from "./foliage-diagnostics";
import { applyEntry, createTree } from "./growth";
import type { Entry, TreeState } from "./types";

const CHECKPOINTS = new Set([3000, 10000, 30000]);

function entry(index: number): Entry {
  return {
    id: `life-${index}`,
    text: `Life entry ${index}`,
    createdAt: index,
    status: "open",
  };
}

function validateLongHistory(state: TreeState, expectedEntries: number): void {
  expect(state.schemaVersion).toBe(2);
  expect(state.growthIndex).toBe(expectedEntries);
  expect(state.leaves).toHaveLength(expectedEntries);
  expect(new Set(state.leaves.map((leaf) => leaf.entryId)).size).toBe(expectedEntries);

  const moduleById = new Map(state.modules.map((module) => [module.id, module]));
  for (const leaf of state.leaves) {
    const host = moduleById.get(leaf.attachment.moduleId);
    expect(host, `${leaf.entryId} host`).toBeDefined();
    if (!host) continue;
    expect(host.bornAtEvent, `${leaf.entryId} future host`).toBeLessThanOrEqual(
      leaf.bornAtEvent,
    );
  }

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
    "continues as the same append-only organism through 30000 entries",
    () => {
      let state = createTree("longevity-soul");
      let at3000: TreeState | undefined;
      let at10000: TreeState | undefined;
      let previousModuleCount = 0;

      for (let index = 1; index <= 30000; index += 1) {
        state = applyEntry(state, entry(index));
        if (!CHECKPOINTS.has(index)) continue;

        validateLongHistory(state, index);
        expect(state.modules.length).toBeGreaterThan(previousModuleCount);
        previousModuleCount = state.modules.length;

        if (index === 3000) {
          at3000 = structuredClone(state);
        }

        if (index === 10000) {
          expect(at3000).toBeDefined();
          if (at3000) {
            expect(state.leaves.slice(0, at3000.leaves.length)).toEqual(at3000.leaves);
            expect(state.modules.slice(0, at3000.modules.length)).toEqual(at3000.modules);
          }
          at10000 = structuredClone(state);
        }

        if (index === 30000) {
          expect(at3000).toBeDefined();
          expect(at10000).toBeDefined();
          if (at3000) {
            expect(state.leaves.slice(0, at3000.leaves.length)).toEqual(at3000.leaves);
            expect(state.modules.slice(0, at3000.modules.length)).toEqual(at3000.modules);
          }
          if (at10000) {
            expect(state.leaves.slice(0, at10000.leaves.length)).toEqual(at10000.leaves);
            expect(state.modules.slice(0, at10000.modules.length)).toEqual(at10000.modules);
          }
        }
      }
    },
    60_000,
  );
});
