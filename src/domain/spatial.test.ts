import { describe, expect, it } from "vitest";
import { replayEntries } from "./growth";
import {
  pointToSegmentDistance3D,
  segmentToSegmentDistance3D,
} from "./spatial";
import {
  projectTreeSpatial,
  spatialEnd,
  spatialStart,
} from "./spatial-geometry";
import type { Entry, Point3D } from "./types";

function p(x: number, y: number, z: number): Point3D {
  return { x, y, z };
}

function entries(count: number): Entry[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `spatial-${index + 1}`,
    text: `Spatial ${index + 1}`,
    createdAt: index + 1,
    status: "open" as const,
  }));
}

describe("3D spatial clearance", () => {
  it("treats a same-depth screen crossing as a physical collision", () => {
    const distance = segmentToSegmentDistance3D(
      p(-2, 0, 0),
      p(2, 0, 0),
      p(0, -2, 0),
      p(0, 2, 0),
    );
    expect(distance).toBeCloseTo(0, 12);
  });

  it("separates the same screen crossing when branches differ in depth", () => {
    const distance = segmentToSegmentDistance3D(
      p(-2, 0, 0),
      p(2, 0, 0),
      p(0, -2, 5),
      p(0, 2, 5),
    );
    expect(distance).toBeCloseTo(5, 12);
  });

  it("computes parallel and skew segment distances", () => {
    expect(
      segmentToSegmentDistance3D(
        p(0, 0, 0),
        p(4, 0, 0),
        p(0, 3, 0),
        p(4, 3, 0),
      ),
    ).toBeCloseTo(3, 12);

    expect(
      segmentToSegmentDistance3D(
        p(-1, 0, 0),
        p(1, 0, 0),
        p(0, -1, 2),
        p(0, 1, 2),
      ),
    ).toBeCloseTo(2, 12);
  });

  it("handles degenerate point-segments without NaN", () => {
    expect(pointToSegmentDistance3D(p(1, 2, 3), p(0, 0, 0), p(0, 0, 0))).toBeCloseTo(
      Math.sqrt(14),
      12,
    );
    expect(
      segmentToSegmentDistance3D(
        p(0, 0, 0),
        p(0, 0, 0),
        p(2, 0, 0),
        p(4, 0, 0),
      ),
    ).toBeCloseTo(2, 12);
  });

  it("is symmetric across segment order", () => {
    const a0 = p(-3, 1, -2);
    const a1 = p(4, 2, 3);
    const b0 = p(0, -4, 5);
    const b1 = p(2, 6, -1);
    const ab = segmentToSegmentDistance3D(a0, a1, b0, b1);
    const ba = segmentToSegmentDistance3D(b0, b1, a0, a1);
    expect(Number.isFinite(ab)).toBe(true);
    expect(ab).toBeGreaterThanOrEqual(0);
    expect(ab).toBeCloseTo(ba, 12);
  });
});

describe("Phase-J spatial projection adapter", () => {
  it("preserves the accepted XY projection while defaulting all depth to zero", () => {
    const state = replayEntries("spatial-projection", entries(30));
    const spatial = projectTreeSpatial(state);

    expect(spatial).toHaveLength(state.modules.length);
    for (const segment of spatial) {
      expect(segment.startDepth).toBe(0);
      expect(segment.endDepth).toBe(0);
      expect(spatialStart(segment)).toEqual({
        x: segment.start.x,
        y: segment.start.y,
        z: 0,
      });
      expect(spatialEnd(segment)).toEqual({
        x: segment.end.x,
        y: segment.end.y,
        z: 0,
      });
    }
  });

  it("accumulates supplied depth deltas along historical parentage without changing XY", () => {
    const state = replayEntries("spatial-depth-deltas", entries(30));
    const target = state.modules.find((module) => module.parentId !== null);
    expect(target).toBeDefined();
    if (!target) return;

    const parent = state.modules.find((module) => module.id === target.parentId);
    expect(parent).toBeDefined();
    if (!parent) return;

    const deltas = new Map<string, number>([
      [parent.id, 3],
      [target.id, -1.25],
    ]);
    const planar = projectTreeSpatial(state);
    const spatial = projectTreeSpatial(state, deltas);
    const planarById = new Map(planar.map((segment) => [segment.id, segment]));
    const spatialById = new Map(spatial.map((segment) => [segment.id, segment]));

    for (const module of state.modules) {
      const before = planarById.get(module.id);
      const after = spatialById.get(module.id);
      expect(after?.start).toEqual(before?.start);
      expect(after?.end).toEqual(before?.end);
      expect(after?.heading).toBe(before?.heading);
      expect(after?.length).toBe(before?.length);
    }

    const parentSpatial = spatialById.get(parent.id);
    const targetSpatial = spatialById.get(target.id);
    expect(parentSpatial?.endDepth).toBeCloseTo(3, 12);
    expect(targetSpatial?.startDepth).toBeCloseTo(3, 12);
    expect(targetSpatial?.endDepth).toBeCloseTo(1.75, 12);
  });

  it("rejects non-finite synthetic depth input", () => {
    const state = replayEntries("spatial-invalid-depth", entries(3));
    const module = state.modules[0];
    expect(() =>
      projectTreeSpatial(state, new Map([[module.id, Number.NaN]])),
    ).toThrow(/Non-finite depth delta/);
  });
});
