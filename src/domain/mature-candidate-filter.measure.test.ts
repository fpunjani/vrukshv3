import { describe, it } from "vitest";
import { diagnoseMatureCandidateReachability } from "./structure";
import { replayEntries } from "./growth";
import type { Entry, GrowthModule, TreeState } from "./types";

const ENABLED = import.meta.env.VITE_JE7_CANDIDATE_FILTER_MEASURE === "1";
const suite = ENABLED ? describe : describe.skip;
const SAMPLE_EVENTS = 6;

function entries(count: number): Entry[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `je7-filter-${index + 1}`,
    text: `JE7 filter ${index + 1}`,
    createdAt: index + 1,
    status: "open" as const,
  }));
}

function beforeEvent(finalState: TreeState, eventIndex: number): TreeState {
  return {
    ...finalState,
    growthIndex: eventIndex - 1,
    modules: finalState.modules.filter((module) => module.bornAtEvent < eventIndex),
    leaves: finalState.leaves.slice(0, eventIndex - 1),
  };
}

function mean(values: readonly number[]): number {
  return values.length > 0
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
}

function sampledModules(finalState: TreeState, milestone: number): GrowthModule[] {
  return finalState.modules
    .filter((module) => module.bornAtEvent > 1000 && module.bornAtEvent <= milestone)
    .slice(-SAMPLE_EVENTS);
}

suite("JE7 mature candidate-filter measurement", () => {
  it(
    "reports why late-life proposals are rejected without changing production behavior",
    () => {
      for (const soul of ["ash-01", "ash-02", "ash-03", "ash-04"] as const) {
        const finalState = replayEntries(soul, entries(30000));

        for (const milestone of [3000, 10000, 30000] as const) {
          const diagnostics = sampledModules(finalState, milestone).map((actual) => {
            const diagnostic = diagnoseMatureCandidateReachability(
              beforeEvent(finalState, actual.bornAtEvent),
              actual.bornAtEvent,
            );
            if (!diagnostic) {
              throw new Error(`Missing JE7 diagnostic for ${soul}/${actual.bornAtEvent}`);
            }
            return diagnostic;
          });

          const rejectionKeys = Object.keys(diagnostics[0]?.candidateRejectionCounts ?? {});
          const rejectionCounts = Object.fromEntries(
            rejectionKeys.map((key) => [
              key,
              diagnostics.reduce(
                (sum, diagnostic) =>
                  sum +
                  diagnostic.candidateRejectionCounts[
                    key as keyof typeof diagnostic.candidateRejectionCounts
                  ],
                0,
              ),
            ]),
          );

          console.log(
            `JE7_CANDIDATE_FILTER_METRIC ${JSON.stringify({
              soul,
              milestone,
              sampledEvents: diagnostics.length,
              meanLegalCandidates: mean(diagnostics.map((item) => item.legalCandidates)),
              meanContinuationCandidates: mean(
                diagnostics.map((item) => item.continuationCandidates),
              ),
              meanUncolonizedAttractors: mean(
                diagnostics.map((item) => item.uncolonizedAttractors),
              ),
              meanImprovableAttractors: mean(
                diagnostics.map((item) => item.improvableAttractors),
              ),
              meanCandidatesWithPositiveOpportunity: mean(
                diagnostics.map((item) => item.candidatesWithPositiveOpportunity),
              ),
              rejectionCounts,
            })}`,
          );
        }
      }
    },
    600_000,
  );
});
