import { describe, expect, it } from "vitest";
import { diagnoseCurvedWood, diagnoseTree } from "./diagnostics";
import { projectTreeCurves, sampleProjectedCurve } from "./geometry";
import { replayEntries } from "./growth";
import { diagnoseMorphology } from "./morphology";
import { segmentToSegmentDistance } from "./spatial";
import type { Entry, GrowthModule, Point, TreeState } from "./types";

const HISTORY: Entry[] = Array.from({ length: 1000 }, (_, index) => ({
  id: `e-${index + 1}`,
  text: `Entry ${index + 1}`,
  createdAt: index,
  status: "open" as const,
}));

function compact(soul: string, milestone: number) {
  const metrics = diagnoseMorphology(replayEntries(soul, HISTORY.slice(0, milestone)));
  return {
    soul,
    milestone,
    modules: metrics.totalModules,
    trunk: metrics.trunkModules,
    lateralFraction: Number(metrics.lateralModuleFraction.toFixed(3)),
    axes: metrics.axisCountByOrder,
    established3: metrics.axesWithAtLeast3ModulesByOrder,
    established5: metrics.axesWithAtLeast5ModulesByOrder,
    order1: metrics.order1AxisCount,
    scaffold3: metrics.establishedOrder1Axes,
    scaffold5: metrics.strongOrder1Axes,
    longestScaffold: metrics.maxOrder1Modules,
    scaffoldSubtree: metrics.maxOrder1SubtreeModules,
    scaffoldSpread: Number(metrics.order1ScaffoldSpread.toFixed(1)),
    height: Number(metrics.totalHeight.toFixed(1)),
    width: Number(metrics.totalWidth.toFixed(1)),
    lowerWidth: Number(metrics.lowerCrownWidth.toFixed(1)),
    middleWidth: Number(metrics.middleCrownWidth.toFixed(1)),
    upperWidth: Number(metrics.upperCrownWidth.toFixed(1)),
    middleAspect: Number(metrics.middleCrownAspect.toFixed(3)),
  };
}

function polylineClearance(a: readonly Point[], b: readonly Point[]): number {
  let minimum = Number.POSITIVE_INFINITY;
  for (let ai = 0; ai < a.length - 1; ai += 1) {
    for (let bi = 0; bi < b.length - 1; bi += 1) {
      minimum = Math.min(
        minimum,
        segmentToSegmentDistance(a[ai], a[ai + 1], b[bi], b[bi + 1]),
      );
    }
  }
  return minimum;
}

function relationSnapshot(module: GrowthModule | undefined) {
  if (!module) return null;
  return {
    id: module.id,
    parentId: module.parentId,
    axisId: module.axisId,
    order: module.order,
    relation: module.relation,
    bornAtEvent: module.bornAtEvent,
  };
}

function closestNonlocalCurvePair(state: TreeState) {
  const curves = projectTreeCurves(state);
  const moduleById = new Map(state.modules.map((module) => [module.id, module]));
  const sampled = new Map(curves.map((curve) => [curve.id, sampleProjectedCurve(curve, 12)]));
  let best:
    | {
        clearance: number;
        a: ReturnType<typeof relationSnapshot>;
        b: ReturnType<typeof relationSnapshot>;
      }
    | undefined;

  for (let ai = 0; ai < curves.length; ai += 1) {
    const a = curves[ai];
    for (let bi = ai + 1; bi < curves.length; bi += 1) {
      const b = curves[bi];
      if (
        a.parentId === b.id ||
        b.parentId === a.id ||
        (a.parentId !== null && a.parentId === b.parentId)
      ) {
        continue;
      }
      const clearance = polylineClearance(sampled.get(a.id) ?? [], sampled.get(b.id) ?? []);
      if (!best || clearance < best.clearance) {
        best = {
          clearance,
          a: relationSnapshot(moduleById.get(a.id)),
          b: relationSnapshot(moduleById.get(b.id)),
        };
      }
    }
  }
  return best;
}

describe("V3 scaffold morphology baseline", () => {
  it("reports the browser-review morphology blind spot before setting acceptance thresholds", () => {
    const report = [100, 300, 1000].flatMap((milestone) =>
      Array.from({ length: 8 }, (_, index) => compact(`ash-0${index + 1}`, milestone)),
    );

    console.log("MORPHOLOGY_BASELINE", JSON.stringify(report));

    const aspectOutlierState = replayEntries("diagnostic-soul-20", HISTORY);
    console.log(
      "ASPECT_OUTLIER",
      JSON.stringify({
        tree: diagnoseTree(aspectOutlierState),
        morphology: diagnoseMorphology(aspectOutlierState),
      }),
    );

    const curveOutlierState = replayEntries("curve-soul-5", HISTORY);
    console.log(
      "CURVE_OUTLIER",
      JSON.stringify({
        curve: diagnoseCurvedWood(curveOutlierState, 8),
        closestPair: closestNonlocalCurvePair(curveOutlierState),
        morphology: diagnoseMorphology(curveOutlierState),
      }),
    );

    for (const row of report) {
      expect(Number.isFinite(row.lateralFraction)).toBe(true);
      expect(Number.isFinite(row.height)).toBe(true);
      expect(Number.isFinite(row.width)).toBe(true);
      expect(row.modules).toBeGreaterThan(0);
    }
  });
});
