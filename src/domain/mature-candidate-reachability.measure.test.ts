import { describe, it } from "vitest";
import { diagnoseMatureCandidateReachability } from "./structure";
import { replayEntries } from "./growth";
import type { Entry, GrowthModule, TreeState } from "./types";

const ENABLED = import.meta.env.VITE_JE3_REACHABILITY_MEASURE === "1";
const suite = ENABLED ? describe : describe.skip;
const SAMPLE_EVENTS = 6;

function entries(count: number): Entry[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `je3-${index + 1}`,
    text: `JE3 ${index + 1}`,
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

suite("JE3 mature candidate reachable-volume measurement", () => {
  it(
    "samples real persisted mature structural decisions around 3k/10k/30k",
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
                `Missing JE3 diagnostic for ${soul} event ${actual.bornAtEvent}`,
              );
            }
            if (
              diagnostic.winnerParentId !== actual.parentId ||
              diagnostic.winnerRelation !== actual.relation
            ) {
              throw new Error(
                `JE3 winner mismatch for ${soul} event ${actual.bornAtEvent}: ` +
                  `${diagnostic.winnerParentId}/${diagnostic.winnerRelation} vs ` +
                  `${actual.parentId}/${actual.relation}`,
              );
            }
            return diagnostic;
          });

          const bestCapture = diagnostics.map((diagnostic) =>
            diagnostic.bestOpportunityScore > 1e-9
              ? diagnostic.winnerOpportunityScore /
                diagnostic.bestOpportunityScore
              : 1,
          );

          console.log(
            `JE3_REACHABILITY_METRIC ${JSON.stringify({
              soul,
              milestone,
              sampledEvents: diagnostics.length,
              meanLegalCandidates: mean(
                diagnostics.map((item) => item.legalCandidates),
              ),
              meanDistinctParents: mean(
                diagnostics.map((item) => item.distinctParents),
              ),
              meanContinuationCandidates: mean(
                diagnostics.map((item) => item.continuationCandidates),
              ),
              meanLateralCandidates: mean(
                diagnostics.map((item) => item.lateralCandidates),
              ),
              meanRenewalCandidates: mean(
                diagnostics.map((item) => item.renewalCandidates),
              ),
              meanContinuationParents: mean(
                diagnostics.map((item) => item.continuationParents),
              ),
              meanContinuationHeadingSpan: mean(
                diagnostics.map((item) => item.meanContinuationHeadingSpan),
              ),
              maxContinuationHeadingSpan: Math.max(
                0,
                ...diagnostics.map((item) => item.maxContinuationHeadingSpan),
              ),
              meanContinuationDepthOptions: mean(
                diagnostics.map((item) => item.meanContinuationDepthOptions),
              ),
              continuationParentsWithMultipleDepthOptions: diagnostics.reduce(
                (sum, item) =>
                  sum + item.continuationParentsWithMultipleDepthOptions,
                0,
              ),
              meanProjectedInwardCandidateFraction: mean(
                diagnostics.map(
                  (item) => item.projectedInwardCandidateFraction,
                ),
              ),
              meanRadialInwardCandidateFraction: mean(
                diagnostics.map((item) => item.radialInwardCandidateFraction),
              ),
              meanUncolonizedAttractors: mean(
                diagnostics.map((item) => item.uncolonizedAttractors),
              ),
              meanImprovableAttractorFraction: mean(
                diagnostics.map((item) => item.improvableAttractorFraction),
              ),
              meanMeaningfulImprovableAttractorFraction: mean(
                diagnostics.map(
                  (item) => item.meaningfulImprovableAttractorFraction,
                ),
              ),
              meanBestAttractorImprovement: mean(
                diagnostics.map((item) => item.meanBestAttractorImprovement),
              ),
              maxBestAttractorImprovement: Math.max(
                0,
                ...diagnostics.map((item) => item.maxBestAttractorImprovement),
              ),
              meanPositiveOpportunityCandidates: mean(
                diagnostics.map(
                  (item) => item.candidatesWithPositiveOpportunity,
                ),
              ),
              winnerIsBestOpportunityFraction: mean(
                diagnostics.map((item) =>
                  item.winnerIsBestOpportunity ? 1 : 0,
                ),
              ),
              meanWinnerOpportunityRank: mean(
                diagnostics.map((item) => item.winnerOpportunityRank),
              ),
              meanWinnerOpportunityCapture: mean(bestCapture),
              historyWinnerMatchFraction: 1,
            })}`,
          );
        }
      }
    },
    600_000,
  );
});
