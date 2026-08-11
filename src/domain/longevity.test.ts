import { describe, expect, it } from "vitest";
import { projectCanopyClusters } from "./canopy-geometry";
import {
  CANOPY_LOD_POLICY,
  entryBucketMap,
  projectCanopyRepresentation,
} from "./canopy-lod";
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

const LOD_BUDGETS = new Map<number, { medium: number; far: number }>([
  // First measured implementation:
  // 3k: 994 medium / 167 far
  // 10k: 2017 medium / 368 far
  // 30k: 3749 medium / 614 far
  // Ceilings retain useful headroom without allowing a quiet return toward
  // one render primitive per identity.
  [3000, { medium: 1200, far: 220 }],
  [10000, { medium: 2400, far: 450 }],
  [30000, { medium: 4500, far: 750 }],
]);

function historicalPrefix(state: TreeState, entries: number): TreeState {
  return {
    schemaVersion: 3,
    soul: state.soul,
    growthIndex: entries,
    modules: state.modules.filter((module) => module.bornAtEvent <= entries),
    leaves: state.leaves.slice(0, entries),
  };
}

function validateRenewalHistory(state: TreeState): void {
  const moduleById = new Map(state.modules.map((module) => [module.id, module]));
  const successorCount = new Map<string, number>();

  for (const module of state.modules) {
    if (
      module.parentId &&
      (module.relation === "continuation" || module.relation === "renewal")
    ) {
      successorCount.set(
        module.parentId,
        (successorCount.get(module.parentId) ?? 0) + 1,
      );
    }

    if (module.relation !== "renewal") continue;
    expect(module.bornAtEvent, `renewal ${module.id} mature birth`).toBeGreaterThan(1000);
    expect(module.order, `renewal ${module.id} fine order`).toBe(4);
    const parent = module.parentId ? moduleById.get(module.parentId) : undefined;
    expect(parent, `renewal ${module.id} parent exists`).toBeDefined();
    expect(parent?.order, `renewal ${module.id} same tier`).toBe(4);
    expect(module.axisId, `renewal ${module.id} new axis`).not.toBe(parent?.axisId);
  }

  for (const [parentId, count] of successorCount) {
    expect(count, `parent ${parentId} successor slot`).toBeLessThanOrEqual(1);
  }

  expect(
    state.modules.reduce((max, module) => Math.max(max, module.order), 0),
    "sympodial renewal must keep hierarchy bounded",
  ).toBeLessThanOrEqual(4);
}

function validateLongHistory(state: TreeState, expectedEntries: number): void {
  expect(state.schemaVersion).toBe(3);
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

  const structure = diagnoseTree(state);
  expect(structure.invariantErrors).toEqual([]);
  expect(structure.crossings).toBe(0);
  expect(structure.belowGroundCount).toBe(0);
  expect(structure.maxChildren).toBeLessThanOrEqual(2);
  expect(Number.isFinite(structure.width)).toBe(true);
  expect(Number.isFinite(structure.height)).toBe(true);
  expect(Number.isFinite(structure.aspectRatio)).toBe(true);
  validateRenewalHistory(state);

  expect(state.modules.length).toBeGreaterThan(50);
  expect(state.modules.length).toBeLessThan(expectedEntries / 4);

  const foliage = diagnoseFoliage(state);
  expect(foliage.totalLeaves).toBe(expectedEntries);
  expect(foliage.maxModuleLoadFraction).toBeLessThan(0.1);
  expect(foliage.maxAxisLoadFraction).toBeLessThan(0.35);
  expect(foliage.trunkLeafFraction).toBeLessThan(0.2);
  expect(foliage.leftRightImbalance).toBeLessThan(0.15);

  const medium = projectCanopyRepresentation(state, "module");
  const far = projectCanopyRepresentation(state, "axis");
  expect(entryBucketMap(medium).size).toBe(expectedEntries);
  expect(entryBucketMap(far).size).toBe(expectedEntries);
  expect(medium.buckets.length).toBeLessThanOrEqual(
    state.modules.length * 2 * CANOPY_LOD_POLICY.modulePositionBins,
  );
  expect(far.buckets.length).toBeLessThanOrEqual(state.modules.length * 2);
  expect(far.buckets.length).toBeLessThanOrEqual(medium.buckets.length);

  const budget = LOD_BUDGETS.get(expectedEntries);
  if (budget) {
    expect(medium.buckets.length, `${expectedEntries} medium LOD budget`).toBeLessThanOrEqual(
      budget.medium,
    );
    expect(far.buckets.length, `${expectedEntries} far LOD budget`).toBeLessThanOrEqual(
      budget.far,
    );
  }
}

function expectBucketPrefixStable(
  earlier: TreeState,
  later: TreeState,
  level: "module" | "axis",
): void {
  const earlierMap = entryBucketMap(projectCanopyRepresentation(earlier, level));
  const laterMap = entryBucketMap(projectCanopyRepresentation(later, level));
  for (const [entryId, key] of earlierMap) {
    expect(laterMap.get(entryId), `${level}:${entryId}`).toBe(key);
  }
}

function expectLongClusterGeometry(state: TreeState): void {
  for (const level of ["module", "axis"] as const) {
    const semantic = projectCanopyRepresentation(state, level);
    const clusters = projectCanopyClusters(state, level);
    expect(clusters).toHaveLength(semantic.buckets.length);

    for (const cluster of clusters) {
      expect(Number.isFinite(cluster.center.x), `${level}:${cluster.key}:center.x`).toBe(true);
      expect(Number.isFinite(cluster.center.y), `${level}:${cluster.key}:center.y`).toBe(true);
      expect(Number.isFinite(cluster.direction.x), `${level}:${cluster.key}:direction.x`).toBe(true);
      expect(Number.isFinite(cluster.direction.y), `${level}:${cluster.key}:direction.y`).toBe(true);
      expect(Number.isFinite(cluster.length), `${level}:${cluster.key}:length`).toBe(true);
      expect(Number.isFinite(cluster.width), `${level}:${cluster.key}:width`).toBe(true);
      expect(Number.isFinite(cluster.depth), `${level}:${cluster.key}:depth`).toBe(true);
      expect(cluster.length).toBeGreaterThan(0);
      expect(cluster.width).toBeGreaterThan(0);
      expect(cluster.memberCount).toBe(cluster.memberEntryIds.length);
      expect(cluster.memberCount).toBeGreaterThan(0);
    }
  }
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
      expect(
        at30000.modules.some((module) => module.relation === "renewal"),
        "30k organism should exercise mature sympodial renewal",
      ).toBe(true);

      expectBucketPrefixStable(at3000, at10000, "module");
      expectBucketPrefixStable(at3000, at10000, "axis");
      expectBucketPrefixStable(at10000, at30000, "module");
      expectBucketPrefixStable(at10000, at30000, "axis");

      // Long-history cluster geometry is derived from the already-built 30k
      // organism and stable representatives; no second history replay occurs.
      expectLongClusterGeometry(at30000);

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

      expectBucketPrefixStable(at30000, after, "module");
      expectBucketPrefixStable(at30000, after, "axis");
    },
    60_000,
  );
});
