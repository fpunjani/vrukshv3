import { describe, expect, it } from "vitest";
import { replayEntries } from "./growth";
import { diagnoseMorphology, summarizeAxes } from "./morphology";
import type { Entry } from "./types";

const HISTORY: Entry[] = Array.from({ length: 300 }, (_, index) => ({
  id: `e-${index + 1}`,
  text: `Entry ${index + 1}`,
  createdAt: index,
  status: "open" as const,
}));

describe("V3 morphology diagnostics", () => {
  it("returns one finite summary per persistent axis", () => {
    const state = replayEntries("morphology-soul", HISTORY);
    const axes = summarizeAxes(state);
    const expectedAxisCount = new Set(state.modules.map((module) => module.axisId)).size;

    expect(axes).toHaveLength(expectedAxisCount);
    expect(new Set(axes.map((axis) => axis.axisId)).size).toBe(axes.length);

    for (const axis of axes) {
      expect(axis.moduleCount).toBeGreaterThan(0);
      expect(axis.axisLength).toBeGreaterThan(0);
      expect(axis.subtreeModuleCount).toBeGreaterThanOrEqual(axis.moduleCount);
      expect(Number.isFinite(axis.tipX)).toBe(true);
      expect(Number.isFinite(axis.tipY)).toBe(true);
      expect(axis.lastGrowthEvent).toBeGreaterThanOrEqual(axis.bornAtEvent);
    }
  });

  it("derives finite crown and scaffold metrics without mutating history", () => {
    const state = replayEntries("morphology-soul", HISTORY);
    const before = structuredClone(state);
    const metrics = diagnoseMorphology(state);

    expect(state).toEqual(before);
    expect(metrics.totalModules).toBe(state.modules.length);
    expect(metrics.trunkModules).toBeGreaterThan(0);
    expect(metrics.lateralModuleFraction).toBeGreaterThanOrEqual(0);
    expect(metrics.lateralModuleFraction).toBeLessThanOrEqual(1);
    expect(metrics.order1AxisCount).toBeGreaterThanOrEqual(metrics.strongOrder1Axes);
    expect(metrics.establishedOrder1Axes).toBeGreaterThanOrEqual(metrics.strongOrder1Axes);
    expect(metrics.totalHeight).toBeGreaterThan(0);
    expect(metrics.totalWidth).toBeGreaterThan(0);
    expect(Number.isFinite(metrics.lowerCrownWidth)).toBe(true);
    expect(Number.isFinite(metrics.middleCrownWidth)).toBe(true);
    expect(Number.isFinite(metrics.upperCrownWidth)).toBe(true);
    expect(Number.isFinite(metrics.middleCrownAspect)).toBe(true);
  });
});
