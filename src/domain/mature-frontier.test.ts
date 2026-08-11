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
      first.postHorizonContinuations +
        first.postHorizonLaterals +
        first.postHorizonRenewals,
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
      first.lateralParentOver50Fraction,
      first.lateralParentOver100Fraction,
      first.lateralParentOver200Fraction,
      first.medianContinuationDormancyGap,
      first.p90ContinuationDormancyGap,
      first.maxContinuationDormancyGap,
      first.continuationDormancyOver50Fraction,
      first.continuationDormancyOver100Fraction,
      first.postHorizonVerticalFraction,
      first.recentVerticalFraction,
      first.terminalAxisCount,
      first.medianTerminalAxisModules,
      first.p90TerminalAxisModules,
      first.maxTerminalAxisModules,
      first.terminalAxisOver3Fraction,
      first.terminalAxisOver5Fraction,
      first.terminalAxisOver8Fraction,
      first.medianTerminalAxisLength,
      first.p90TerminalAxisLength,
      first.maxTerminalAxisLength,
      first.postHorizonTerminalModuleFraction,
      first.legacyScaffoldModuleShare,
      first.crownWidth,
      first.crownHeight,
      first.crownAspect,
      ...first.postHorizonVerticalFractionByOrder,
      ...first.recentVerticalFractionByOrder,
    ]) {
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
    }

    for (const fraction of [
      first.legacyWoodLateralFraction,
      first.lateralParentOver50Fraction,
      first.lateralParentOver100Fraction,
      first.lateralParentOver200Fraction,
      first.continuationDormancyOver50Fraction,
      first.continuationDormancyOver100Fraction,
      first.postHorizonVerticalFraction,
      first.recentVerticalFraction,
      first.terminalAxisOver3Fraction,
      first.terminalAxisOver5Fraction,
      first.terminalAxisOver8Fraction,
      first.postHorizonTerminalModuleFraction,
      first.legacyScaffoldModuleShare,
      ...first.postHorizonVerticalFractionByOrder,
      ...first.recentVerticalFractionByOrder,
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
    expect(diagnostics.postHorizonRenewals).toBe(0);
    expect(diagnostics.postHorizonContinuations).toBe(0);
    expect(diagnostics.newOrder1Axes).toBe(0);
    expect(diagnostics.legacyWoodLateralActivations).toBe(0);
    expect(diagnostics.lateralParentOver50Fraction).toBe(0);
    expect(diagnostics.continuationDormancyOver50Fraction).toBe(0);
    expect(diagnostics.postHorizonTerminalModuleFraction).toBe(0);
    expect(diagnostics.postHorizonVerticalFractionByOrder.every((value) => value === 0)).toBe(true);
  });
});
