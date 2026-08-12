import { describe, expect, it } from "vitest";
import { diagnoseMatureCandidateReachability } from "./structure";
import { replayEntries } from "./growth";
import type { Entry, TreeState } from "./types";

function entries(count: number): Entry[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `reachability-${index + 1}`,
    text: `Reachability ${index + 1}`,
    createdAt: index + 1,
    status: "open" as const,
  }));
}

function beforeEvent(finalState: TreeState, eventIndex: number): TreeState {
  return {
    ...finalState,
    growthIndex: eventIndex - 1,
    modules: finalState.modules.filter(
      (module) => module.bornAtEvent < eventIndex,
    ),
    leaves: finalState.leaves.slice(0, eventIndex - 1),
  };
}

describe("mature candidate reachability diagnostics", () => {
  it("is deterministic, reproduces history, and exposes the exact production score", () => {
    const finalState = replayEntries("ash-01", entries(1500));
    const actual = [...finalState.modules]
      .reverse()
      .find((module) => module.bornAtEvent > 1000);
    expect(actual).toBeDefined();
    if (!actual) return;

    const state = beforeEvent(finalState, actual.bornAtEvent);
    const diagnostic = diagnoseMatureCandidateReachability(
      state,
      actual.bornAtEvent,
    );
    const again = diagnoseMatureCandidateReachability(
      state,
      actual.bornAtEvent,
    );

    expect(diagnostic).not.toBeNull();
    expect(again).toEqual(diagnostic);
    expect(diagnostic?.legalCandidates ?? 0).toBeGreaterThan(0);
    expect(diagnostic?.winnerParentId).toBe(actual.parentId);
    expect(diagnostic?.winnerRelation).toBe(actual.relation);
    expect(diagnostic?.uncolonizedAttractors ?? 0).toBeGreaterThan(0);
    expect(diagnostic?.winnerBreakdown.totalScore).toBeCloseTo(
      diagnostic?.winnerScore ?? 0,
      10,
    );
    expect(
      Number.isFinite(diagnostic?.bestOpportunityBreakdown.totalScore ?? NaN),
    ).toBe(true);
    expect(
      Number.isFinite(diagnostic?.winnerBreakdown.nonOpportunityScore ?? NaN),
    ).toBe(true);
    expect(
      Number.isFinite(
        diagnostic?.bestOpportunityBreakdown.nonOpportunityScore ?? NaN,
      ),
    ).toBe(true);
    if (!diagnostic?.winnerIsBestOpportunity) {
      expect(diagnostic?.breakEvenOpportunityWeight).not.toBeNull();
      expect(diagnostic?.breakEvenOpportunityWeight ?? 0).toBeGreaterThanOrEqual(1);
    }
  }, 8_000);
});
