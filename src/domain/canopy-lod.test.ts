import { describe, expect, it } from "vitest";
import {
  CANOPY_LOD_POLICY,
  entryBucketMap,
  farBucketForModuleBucket,
  projectCanopyRepresentation,
  type ModuleCanopyBucket,
} from "./canopy-lod";
import { replayEntries } from "./growth";
import { projectLeafForms } from "./leaf-form";
import type { Entry, TreeState } from "./types";

function entries(count: number): Entry[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `lod-${index + 1}`,
    text: `LOD entry ${index + 1}`,
    createdAt: index,
    status: "open" as const,
  }));
}

function expectExactCoverage(state: TreeState, level: "individual" | "module" | "axis"): void {
  const representation = projectCanopyRepresentation(state, level);
  const mapping = entryBucketMap(representation);
  const identityIds = new Set(state.leaves.map((leaf) => leaf.entryId));

  expect(mapping.size).toBe(state.leaves.length);
  expect(new Set(mapping.keys())).toEqual(identityIds);

  const flattened = representation.buckets.flatMap((bucket) => bucket.memberEntryIds);
  expect(flattened).toHaveLength(state.leaves.length);
  expect(new Set(flattened).size).toBe(state.leaves.length);

  for (const bucket of representation.buckets) {
    expect(bucket.memberEntryIds.length).toBeGreaterThan(0);
    expect(bucket.memberEntryIds).toContain(bucket.representativeEntryId);
    for (const entryId of bucket.memberEntryIds) {
      expect(identityIds.has(entryId), `${level}:${bucket.key}:${entryId}`).toBe(true);
    }
  }
}

describe("V3 canopy representation + LOD", () => {
  it("covers every permanent identity exactly once at every detail level", () => {
    const state = replayEntries("lod-coverage", entries(1000));

    expectExactCoverage(state, "individual");
    expectExactCoverage(state, "module");
    expectExactCoverage(state, "axis");

    const individual = projectCanopyRepresentation(state, "individual");
    const forms = projectLeafForms(state);
    expect(individual.buckets).toHaveLength(forms.length);
    expect(
      new Set(individual.buckets.map((bucket) => bucket.representativeEntryId)),
    ).toEqual(new Set(forms.map((form) => form.entryId)));
  });

  it("is deterministic and does not mutate persistent state", () => {
    const state = replayEntries("lod-determinism", entries(1000));
    const before = structuredClone(state);

    for (const level of ["individual", "module", "axis"] as const) {
      expect(projectCanopyRepresentation(state, level)).toEqual(
        projectCanopyRepresentation(state, level),
      );
    }

    expect(state).toEqual(before);
  });

  it("keeps old medium and far bucket assignments unchanged as history grows", () => {
    const history = entries(1000);
    const at300 = replayEntries("lod-append-stability", history.slice(0, 300));
    const at1000 = replayEntries("lod-append-stability", history);

    for (const level of ["module", "axis"] as const) {
      const earlier = entryBucketMap(projectCanopyRepresentation(at300, level));
      const later = entryBucketMap(projectCanopyRepresentation(at1000, level));

      for (const [entryId, key] of earlier) {
        expect(later.get(entryId), `${level}:${entryId}`).toBe(key);
      }
    }
  });

  it("makes medium buckets nest into exactly one far bucket", () => {
    const state = replayEntries("lod-nesting", entries(1000));
    const medium = projectCanopyRepresentation(state, "module");
    const farMap = entryBucketMap(projectCanopyRepresentation(state, "axis"));

    for (const bucket of medium.buckets as ModuleCanopyBucket[]) {
      const expectedFarKey = farBucketForModuleBucket(state, bucket);
      const memberFarKeys = new Set(
        bucket.memberEntryIds.map((entryId) => farMap.get(entryId)),
      );
      expect(memberFarKeys).toEqual(new Set([expectedFarKey]));
    }
  });

  it("bounds coarser primitive counts by persistent wood complexity", () => {
    const state = replayEntries("lod-bounds", entries(1000));
    const medium = projectCanopyRepresentation(state, "module");
    const far = projectCanopyRepresentation(state, "axis");

    expect(medium.buckets.length).toBeLessThanOrEqual(
      state.modules.length * 2 * CANOPY_LOD_POLICY.modulePositionBins,
    );
    expect(far.buckets.length).toBeLessThanOrEqual(state.modules.length * 2);
    expect(far.buckets.length).toBeLessThanOrEqual(medium.buckets.length);
    expect(medium.buckets.length).toBeLessThan(state.leaves.length);
    expect(far.buckets.length).toBeLessThan(state.leaves.length);
  });
});
