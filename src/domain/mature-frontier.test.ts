import { describe, expect, it } from "vitest";
import { diagnoseMatureFrontier } from "./mature-frontier";
import { replayEntries } from "./growth";
import type { Entry } from "./types";

function entries(count: number): Entry[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `frontier-${index + 1}`,
    text: `Frontier ${index + 1}`,
    createdAt: index,
    status: "open" as const,
  }));
}

describe("V3 mature frontier diagnostics", () => {
  it("is deterministic, finite, and observational only", () => {
    const state = replayEntries("frontier-diagnostics", entries(3000));
    const before = structuredClone(state);
    const first = diagnoseMatureFrontier(state);
    const repeated = diagnoseMatureFrontier(state);

    expect(repeated).toEqual(first);
    expect(state).toEqual(before);
    expect(first.postHorizonModules).toBeGreaterThan(0);
    expect(
      first.postHorizonContinuations + first.postHorizonLaterals,
    ).toBe(first.postHorizonModules);
    expect(
      first.postHorizonOrderCounts.reduce((sum, count) => sum + count, 0),
    ).toBe(first.postHorizonModules);

    for (const value of [
      first.legacyWoodLateralFraction,
      first.medianParentStructuralAge,
      first.p90ParentStructuralAge,
      first.maxParentStructuralAge,
      first.medianLateralParentStructuralAge,
      first.p90LateralParentStructuralAge,
      first.maxLateralParentStructuralAge,
      first.medianContinuationDormancyGap,
      first.p90ContinuationDormancyGap,
      first.maxContinuationDormancyGap,
      first.postHorizonVerticalFraction,
      first.recentVerticalFraction,
      first.legacyScaffoldModuleShare,
      first.crownWidth,
      first.crownHeight,
      first.crownAspect,
    ]) {
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
    }

    for (const fraction of [
      first.legacyWoodLateralFraction,
      first.postHorizonVerticalFraction,
      first.recentVerticalFraction,
      first.legacyScaffoldModuleShare,
    ]) {
      expect(fraction).toBeLessThanOrEqual(1);
    }
  });

  it("reports an empty post-horizon window at the accepted 1000-entry boundary", () => {
    const diagnostics = diagnoseMatureFrontier(
      replayEntries("frontier-boundary", entries(1000)),
    );
    expect(diagnostics.postHorizonModules).toBe(0);
    expect(diagnostics.postHorizonLaterals).toBe(0);
    expect(diagnostics.postHorizonContinuations).toBe(0);
    expect(diagnostics.newOrder1Axes).toBe(0);
    expect(diagnostics.legacyWoodLateralActivations).toBe(0);
  });
});
