import { describe, it } from "vitest";
import { projectCanopyRepresentation } from "./canopy-lod";
import { diagnoseMatureFrontier } from "./mature-frontier";
import { replayEntries } from "./growth";
import { diagnoseSpatialWood } from "./spatial-diagnostics";
import type { Entry } from "./types";

const ENABLED = import.meta.env.VITE_SPATIAL_MATURE_MEASURE === "1";
const suite = ENABLED ? describe : describe.skip;

function entries(count: number): Entry[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `spatial-life-${index + 1}`,
    text: `Spatial life ${index + 1}`,
    createdAt: index + 1,
    status: "open" as const,
  }));
}

suite("JC spatial mature measurement", () => {
  it(
    "reports depth use, projected crossings, and representation cost",
    () => {
      const milestones = [3000, 10000, 30000] as const;
      const souls = ["ash-01", "ash-02", "ash-03", "ash-04"] as const;

      for (const soul of souls) {
        const state30000 = replayEntries(soul, entries(30000));
        for (const milestone of milestones) {
          const state = {
            ...state30000,
            growthIndex: milestone,
            modules: state30000.modules.filter(
              (module) => module.bornAtEvent <= milestone,
            ),
            leaves: state30000.leaves.slice(0, milestone),
          };
          const spatial = diagnoseSpatialWood(state);
          const frontier = diagnoseMatureFrontier(state);
          const medium = projectCanopyRepresentation(state, "module");
          const far = projectCanopyRepresentation(state, "axis");
          const renewals = state.modules.filter(
            (module) => module.relation === "renewal",
          ).length;
          const matureModules = state.modules.filter(
            (module) => module.bornAtEvent > 1000,
          );
          const matureDepthModules = matureModules.filter(
            (module) => Math.abs(module.restDepth) > 1e-9,
          ).length;

          console.log(
            "SPATIAL_MATURE_METRIC",
            JSON.stringify({
              soul,
              milestone,
              modules: state.modules.length,
              matureModules: matureModules.length,
              renewals,
              matureDepthModules,
              matureDepthFraction:
                matureModules.length > 0
                  ? matureDepthModules / matureModules.length
                  : 0,
              ...spatial,
              crownWidth: frontier.crownWidth,
              crownHeight: frontier.crownHeight,
              crownAspect: frontier.crownAspect,
              mediumBuckets: medium.buckets.length,
              farBuckets: far.buckets.length,
            }),
          );
        }
      }
    },
    180_000,
  );
});
