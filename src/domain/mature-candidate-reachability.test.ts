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
  it("is deterministic and reproduces the persisted winner at a real mature structural event", () => {
    const finalState = replayEntries("ash-01", entries(3000));
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
  }, 15_000);
});
