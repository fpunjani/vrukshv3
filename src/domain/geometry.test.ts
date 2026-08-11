import { describe, expect, it } from "vitest";
import { diagnoseCurvedWood } from "./diagnostics";
import { projectTree, projectTreeCurves } from "./geometry";
import { replayEntries } from "./growth";
import type { Entry } from "./types";

const HISTORY: Entry[] = Array.from({ length: 1000 }, (_, index) => ({ id: `e-${index + 1}`, text: `Entry ${index + 1}`, createdAt: index, status: "open" as const }));

describe("V3 structural geometry projection", () => {
  it("preserves structural endpoints while adding derived curve controls", () => {
    const state = replayEntries("geometry-soul", HISTORY.slice(0, 300));
    const segments = projectTree(state), curves = projectTreeCurves(state);
    expect(curves).toHaveLength(segments.length);
    for (let index = 0; index < curves.length; index += 1) {
      expect(curves[index].start).toEqual(segments[index].start); expect(curves[index].end).toEqual(segments[index].end);
      expect(curves[index].thickness).toBe(segments[index].thickness); expect(curves[index].startThickness).toBeGreaterThan(0); expect(curves[index].endThickness).toBeGreaterThan(0); expect(curves[index].endThickness).toBeLessThanOrEqual(curves[index].startThickness);
    }
  });
  it("shares exact tangent and diameter continuity across continuation joints", () => {
    const state = replayEntries("geometry-soul", HISTORY.slice(0, 300)); const curves = new Map(projectTreeCurves(state).map((curve) => [curve.id, curve]));
    for (const module of state.modules) {
      if (module.relation !== "continuation" || !module.parentId) continue;
      const parent = curves.get(module.parentId), child = curves.get(module.id); expect(parent).toBeDefined(); expect(child).toBeDefined(); expect(child?.startTangent).toBeCloseTo(parent?.endTangent ?? 0, 12); expect(child?.startThickness).toBeCloseTo(parent?.endThickness ?? 0, 12);
    }
  });
  it("keeps rendered curved wood collision-free and mechanically coherent across 16 mature souls", () => {
    for (let soulIndex = 0; soulIndex < 16; soulIndex += 1) {
      const diagnostics = diagnoseCurvedWood(replayEntries(`curve-soul-${soulIndex}`, HISTORY), 8);
      expect(diagnostics.curveCrossings, `curve-soul-${soulIndex} crossings`).toBe(0); expect(diagnostics.crowdedPairs, `curve-soul-${soulIndex} crowding`).toBe(0); expect(diagnostics.belowGroundSamples, `curve-soul-${soulIndex} ground`).toBe(0); expect(diagnostics.taperErrors, `curve-soul-${soulIndex} taper`).toBe(0); expect(diagnostics.continuationDiameterErrors, `curve-soul-${soulIndex} continuation diameter`).toBe(0); expect(diagnostics.lateralDiameterErrors, `curve-soul-${soulIndex} lateral diameter`).toBe(0);
    }
  }, 10_000);
});
