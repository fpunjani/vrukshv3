import { describe, expect, it } from "vitest";
import { projectCanopyClusters } from "./canopy-geometry";
import { projectCanopyRepresentation } from "./canopy-lod";
import { replayEntries } from "./growth";
import { projectLeafForms } from "./leaf-form";
import type { Entry, Point } from "./types";

function entries(count: number): Entry[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `cluster-${index + 1}`,
    text: `Cluster entry ${index + 1}`,
    createdAt: index,
    status: "open" as const,
  }));
}

function finite(point: Point): boolean {
  return Number.isFinite(point.x) && Number.isFinite(point.y);
}

describe("V3 canopy cluster projection", () => {
  it("projects one finite diagnostic cluster for every semantic medium/far bucket", () => {
    const state = replayEntries("cluster-projection", entries(1000));
    const fullForms = new Map(
      projectLeafForms(state).map((form) => [form.entryId, form]),
    );

    for (const level of ["module", "axis"] as const) {
      const representation = projectCanopyRepresentation(state, level);
      const clusters = projectCanopyClusters(state, level);
      expect(clusters).toHaveLength(representation.buckets.length);

      const semanticByKey = new Map(
        representation.buckets.map((bucket) => [bucket.key, bucket]),
      );
      for (const cluster of clusters) {
        const semantic = semanticByKey.get(cluster.key);
        const representative = fullForms.get(cluster.representativeEntryId);
        expect(semantic).toBeDefined();
        expect(representative).toBeDefined();
        if (!semantic || !representative) continue;

        expect(cluster.memberEntryIds).toEqual(semantic.memberEntryIds);
        expect(cluster.memberCount).toBe(semantic.memberEntryIds.length);
        expect(cluster.hostModuleId).toBe(representative.moduleId);
        expect(cluster.direction).toEqual(representative.direction);
        expect(cluster.depth).toBe(representative.depth);
        expect(finite(cluster.center)).toBe(true);
        expect(finite(cluster.direction)).toBe(true);
        expect(Number.isFinite(cluster.length)).toBe(true);
        expect(Number.isFinite(cluster.width)).toBe(true);
        expect(cluster.length).toBeGreaterThan(0);
        expect(cluster.width).toBeGreaterThan(0);
      }
    }
  });

  it("keeps a bucket's earliest representative identity stable under append", () => {
    const history = entries(1000);
    const at300 = replayEntries("cluster-representative", history.slice(0, 300));
    const at1000 = replayEntries("cluster-representative", history);

    for (const level of ["module", "axis"] as const) {
      const earlier = new Map(
        projectCanopyClusters(at300, level).map((cluster) => [cluster.key, cluster]),
      );
      const later = new Map(
        projectCanopyClusters(at1000, level).map((cluster) => [cluster.key, cluster]),
      );

      for (const [key, cluster] of earlier) {
        const future = later.get(key);
        expect(future, key).toBeDefined();
        expect(future?.representativeEntryId, key).toBe(cluster.representativeEntryId);
      }
    }
  });

  it("is deterministic for the same state", () => {
    const state = replayEntries("cluster-determinism", entries(1000));
    expect(projectCanopyClusters(state, "module")).toEqual(
      projectCanopyClusters(state, "module"),
    );
    expect(projectCanopyClusters(state, "axis")).toEqual(
      projectCanopyClusters(state, "axis"),
    );
  });
});
