import { describe, expect, it } from "vitest";
import { deriveScaffoldBalancedMeristemFrontier } from "./mature-meristem-frontier";
import type { GrowthModule, GrowthRelation } from "./types";

function module(
  id: string,
  parentId: string | null,
  axisId: string,
  relation: GrowthRelation,
  order: number,
  bornAtEvent: number,
): GrowthModule {
  return {
    id,
    parentId,
    axisId,
    relation,
    order,
    bornAtEvent,
    restTurn: 0,
    restLength: 8,
    restDepth: 0,
  };
}

/**
 * A tiny topologically valid fixture is better for this selector unit test than
 * replaying four 3k organisms. Multi-soul/lifetime behavior is covered by the
 * dedicated frontier measurement gate; this test isolates the pure reserve rule.
 */
function fixture(): GrowthModule[] {
  return [
    module("root", null, "axis-0", "origin", 0, 1),
    module("trunk-2", "root", "axis-0", "continuation", 0, 2),

    module("a-root", "root", "axis-a", "lateral", 1, 10),
    module("a-cont-1", "a-root", "axis-a", "continuation", 1, 20),
    module("a-tip-1", "a-root", "axis-a1", "lateral", 2, 21),
    module("a-cont-2", "a-cont-1", "axis-a", "continuation", 1, 30),
    module("a-tip-2", "a-cont-1", "axis-a2", "lateral", 2, 31),
    module("a-cont-3", "a-cont-2", "axis-a", "continuation", 1, 40),
    module("a-tip-3", "a-cont-2", "axis-a3", "lateral", 2, 41),

    module("trunk-3", "trunk-2", "axis-0", "continuation", 0, 50),
    module("b-root", "trunk-2", "axis-b", "lateral", 1, 60),
    module("b-cont-1", "b-root", "axis-b", "continuation", 1, 70),
    module("b-tip-1", "b-root", "axis-b1", "lateral", 2, 71),
    module("b-cont-2", "b-cont-1", "axis-b", "continuation", 1, 80),
    module("b-tip-2", "b-cont-1", "axis-b2", "lateral", 2, 81),
  ];
}

describe("scaffold-balanced mature meristem frontier", () => {
  it("preserves recent living tips and supplements only underrepresented scaffold lineages", () => {
    const modules = fixture();
    const frontier = deriveScaffoldBalancedMeristemFrontier(
      modules,
      1000,
      2,
      2,
    );
    const again = deriveScaffoldBalancedMeristemFrontier(
      modules,
      1000,
      2,
      2,
    );

    expect([...again.selectedTipIds]).toEqual([...frontier.selectedTipIds]);
    expect(frontier.acceptedScaffoldAxes).toEqual(["axis-a", "axis-b"]);

    for (const id of frontier.recentTipIds) {
      expect(frontier.selectedTipIds.has(id)).toBe(true);
    }
    for (const id of frontier.reserveTipIds) {
      expect(frontier.recentTipIds.has(id)).toBe(false);
      expect(frontier.livingTipIds.has(id)).toBe(true);
    }

    expect(frontier.selectedByScaffold.get("axis-a")?.length).toBe(2);
    expect(frontier.selectedByScaffold.get("axis-b")?.length).toBeGreaterThanOrEqual(2);
    expect(frontier.reserveTipIds.size).toBe(2);
    expect(frontier.selectedTipIds.size).toBeLessThanOrEqual(
      frontier.recentTipIds.size + frontier.acceptedScaffoldAxes.length * 2,
    );
  });
});
