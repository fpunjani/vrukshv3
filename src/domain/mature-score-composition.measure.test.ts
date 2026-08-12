import { describe, it } from "vitest";
import { diagnoseMatureCandidateReachability } from "./structure";
import { replayEntries } from "./growth";
import type { CandidateScoreBreakdown } from "./structure";
import type { Entry, GrowthModule, GrowthRelation, TreeState } from "./types";

const ENABLED = import.meta.env.VITE_JE5_SCORE_MEASURE === "1";
const suite = ENABLED ? describe : describe.skip;
const SAMPLE_EVENTS = 6;

function entries(count: number): Entry[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `je5-${index + 1}`,
    text: `JE5 ${index + 1}`,
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

function sampledModules(
  finalState: TreeState,
  milestone: number,
): GrowthModule[] {
  return finalState.modules
    .filter(
      (module) =>
        module.bornAtEvent > 1000 && module.bornAtEvent <= milestone,
    )
    .slice(-SAMPLE_EVENTS);
}

function mean(values: readonly number[]): number {
  return values.length > 0
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
}

function quantile(values: readonly number[], q: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(sorted.length * q) - 1),
  );
  return sorted[index];
}

function componentDelta(
  winner: CandidateScoreBreakdown,
  best: CandidateScoreBreakdown,
  key:
    | "baseVigorContribution"
    | "spaceContribution"
    | "crownEnvelopeContribution"
    | "firstOrderSideContribution"
    | "architectureContribution"
    | "recencyContribution"
    | "jitterContribution"
    | "nonOpportunityScore"
    | "opportunityContribution",
): number {
  return winner[key] - best[key];
}

function relationCounts(relations: readonly (string | null)[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const relation of relations) {
    const key = relation ?? "none";
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

/**
 * JE6 hypothesis preview only. This does not change production scoring.
 * Mature, already-established order-3/4 continuations keep the juvenile
 * establishment bonus while no longer accumulating an unbounded excess-length
 * penalty. Everything else keeps its measured architecture contribution.
 */
function matureNoExcessArchitecture(
  relation: Exclude<GrowthRelation, "origin"> | null,
  order: number,
  axisModules: number,
  measured: number,
): number {
  if (relation !== "continuation" || order < 3) return measured;
  const preferred = order === 3 ? 4 : 3;
  const deficit = Math.max(0, preferred - axisModules);
  return Math.min(2.5, deficit * 0.52);
}

suite("JE5 mature score-composition measurement", () => {
  it(
    "decomposes actual winners versus highest-opportunity legal candidates",
    () => {
      for (const soul of ["ash-01", "ash-02", "ash-03", "ash-04"]) {
        const finalState = replayEntries(soul, entries(30000));

        for (const milestone of [3000, 10000, 30000]) {
          const actualModules = sampledModules(finalState, milestone);
          const diagnostics = actualModules.map((actual) => {
            const state = beforeEvent(finalState, actual.bornAtEvent);
            const diagnostic = diagnoseMatureCandidateReachability(
              state,
              actual.bornAtEvent,
            );
            if (!diagnostic) {
              throw new Error(
                `Missing JE5 diagnostic for ${soul} event ${actual.bornAtEvent}`,
              );
            }
            if (
              diagnostic.winnerParentId !== actual.parentId ||
              diagnostic.winnerRelation !== actual.relation
            ) {
              throw new Error(
                `JE5 winner mismatch for ${soul} event ${actual.bornAtEvent}`,
              );
            }
            if (
              Math.abs(
                diagnostic.winnerBreakdown.totalScore - diagnostic.winnerScore,
              ) > 1e-9
            ) {
              throw new Error(
                `JE5 score sum mismatch for ${soul} event ${actual.bornAtEvent}`,
              );
            }
            return diagnostic;
          });

          const contests = diagnostics.filter(
            (item) =>
              !item.winnerIsBestOpportunity &&
              item.breakEvenOpportunityWeight !== null &&
              Number.isFinite(item.breakEvenOpportunityWeight),
          );
          const breakEven = contests.map(
            (item) => item.breakEvenOpportunityWeight as number,
          );
          const winnerOpportunityCapture = diagnostics.map((item) =>
            item.bestOpportunityScore > 1e-9
              ? item.winnerOpportunityScore / item.bestOpportunityScore
              : 1,
          );

          const deltas = (
            key: Parameters<typeof componentDelta>[2],
          ): number[] =>
            contests.map((item) =>
              componentDelta(
                item.winnerBreakdown,
                item.bestOpportunityBreakdown,
                key,
              ),
            );

          const hypothetical = diagnostics.map((item) => {
            const winnerArchitecture = matureNoExcessArchitecture(
              item.winnerRelation,
              item.winnerOrder,
              item.winnerAxisModules,
              item.winnerBreakdown.architectureContribution,
            );
            const bestArchitecture = matureNoExcessArchitecture(
              item.bestOpportunityRelation,
              item.bestOpportunityOrder,
              item.bestOpportunityAxisModules,
              item.bestOpportunityBreakdown.architectureContribution,
            );
            const winnerScore =
              item.winnerBreakdown.totalScore -
              item.winnerBreakdown.architectureContribution +
              winnerArchitecture;
            const bestScore =
              item.bestOpportunityBreakdown.totalScore -
              item.bestOpportunityBreakdown.architectureContribution +
              bestArchitecture;
            return {
              bestOvertakesWinner: bestScore > winnerScore + 1e-9,
              scoreDelta: bestScore - winnerScore,
              winnerArchitectureDelta:
                winnerArchitecture - item.winnerBreakdown.architectureContribution,
              bestArchitectureDelta:
                bestArchitecture -
                item.bestOpportunityBreakdown.architectureContribution,
            };
          });

          console.log(
            `JE5_SCORE_METRIC ${JSON.stringify({
              soul,
              milestone,
              sampledEvents: diagnostics.length,
              opportunityContests: contests.length,
              winnerIsBestOpportunityFraction: mean(
                diagnostics.map((item) =>
                  item.winnerIsBestOpportunity ? 1 : 0,
                ),
              ),
              meanWinnerOpportunityRank: mean(
                diagnostics.map((item) => item.winnerOpportunityRank),
              ),
              meanWinnerOpportunityCapture: mean(winnerOpportunityCapture),
              meanBreakEvenOpportunityWeight: mean(breakEven),
              medianBreakEvenOpportunityWeight: quantile(breakEven, 0.5),
              p90BreakEvenOpportunityWeight: quantile(breakEven, 0.9),
              breakEvenLe125Fraction: mean(
                breakEven.map((value) => (value <= 1.25 ? 1 : 0)),
              ),
              breakEvenLe15Fraction: mean(
                breakEven.map((value) => (value <= 1.5 ? 1 : 0)),
              ),
              breakEvenLe2Fraction: mean(
                breakEven.map((value) => (value <= 2 ? 1 : 0)),
              ),
              breakEvenLe3Fraction: mean(
                breakEven.map((value) => (value <= 3 ? 1 : 0)),
              ),
              meanWinnerMinusBestBaseVigor: mean(
                deltas("baseVigorContribution"),
              ),
              meanWinnerMinusBestSpace: mean(deltas("spaceContribution")),
              meanWinnerMinusBestCrownEnvelope: mean(
                deltas("crownEnvelopeContribution"),
              ),
              meanWinnerMinusBestFirstOrderSide: mean(
                deltas("firstOrderSideContribution"),
              ),
              meanWinnerMinusBestArchitecture: mean(
                deltas("architectureContribution"),
              ),
              meanWinnerMinusBestRecency: mean(
                deltas("recencyContribution"),
              ),
              meanWinnerMinusBestJitter: mean(deltas("jitterContribution")),
              meanWinnerMinusBestNonOpportunity: mean(
                deltas("nonOpportunityScore"),
              ),
              meanWinnerMinusBestOpportunity: mean(
                deltas("opportunityContribution"),
              ),
              meanWinnerArchitectureContribution: mean(
                diagnostics.map(
                  (item) => item.winnerBreakdown.architectureContribution,
                ),
              ),
              meanBestOpportunityArchitectureContribution: mean(
                diagnostics.map(
                  (item) => item.bestOpportunityBreakdown.architectureContribution,
                ),
              ),
              meanWinnerAxisModules: mean(
                diagnostics.map((item) => item.winnerAxisModules),
              ),
              meanBestOpportunityAxisModules: mean(
                diagnostics.map((item) => item.bestOpportunityAxisModules),
              ),
              winnerUnderEstablishedAxisFraction: mean(
                diagnostics.map((item) =>
                  item.winnerOrder >= 4 && item.winnerAxisModules < 3 ? 1 : 0,
                ),
              ),
              winnerOrders: relationCounts(
                diagnostics.map((item) => String(item.winnerOrder)),
              ),
              bestOpportunityOrders: relationCounts(
                diagnostics.map((item) => String(item.bestOpportunityOrder)),
              ),
              winnerRelations: relationCounts(
                diagnostics.map((item) => item.winnerRelation),
              ),
              bestOpportunityRelations: relationCounts(
                diagnostics.map((item) => item.bestOpportunityRelation),
              ),
              hypotheticalNoMatureFineExcessBestOvertakesFraction: mean(
                hypothetical.map((item) =>
                  item.bestOvertakesWinner ? 1 : 0,
                ),
              ),
              hypotheticalNoMatureFineExcessMeanBestMinusWinner: mean(
                hypothetical.map((item) => item.scoreDelta),
              ),
              hypotheticalMeanWinnerArchitectureLift: mean(
                hypothetical.map((item) => item.winnerArchitectureDelta),
              ),
              hypotheticalMeanBestArchitectureLift: mean(
                hypothetical.map((item) => item.bestArchitectureDelta),
              ),
              historyWinnerMatchFraction: 1,
            })}`,
          );
        }
      }
    },
    600_000,
  );
});
