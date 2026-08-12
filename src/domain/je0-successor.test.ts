import { describe, expect, it } from "vitest";
import { diagnoseTree } from "./diagnostics";
import type { GrowthModule, TreeState } from "./types";

function module(
  id: string,
  parentId: string | null,
  axisId: string,
  relation: GrowthModule["relation"],
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
    restTurn: relation === "lateral" ? 12 : relation === "renewal" ? -5 : 0,
    restLength: 8,
    restDepth: 0,
  };
}

function validRenewalState(): TreeState {
  const modules: GrowthModule[] = [
    module("root", null, "axis-0", "origin", 0, 1),
    module("o1", "root", "axis-1", "lateral", 1, 2),
    module("o2", "o1", "axis-2", "lateral", 2, 3),
    module("o3", "o2", "axis-3", "lateral", 3, 4),
    module("o4", "o3", "axis-4", "lateral", 4, 5),
    module("renew", "o4", "axis-renew", "renewal", 4, 1001),
  ];

  return {
    schemaVersion: 3,
    soul: "synthetic-successor",
    growthIndex: 1,
    modules,
    leaves: [
      {
        entryId: "leaf-1",
        bornAtEvent: 1,
        createdAt: 1,
        status: "open",
        attachment: { moduleId: "root", position: 0.5, side: 1 },
      },
    ],
  };
}

describe("JE0 sympodial successor semantics", () => {
  it("accepts one renewal successor and rejects a second continuation/renewal successor", () => {
    const valid = validRenewalState();
    expect(diagnoseTree(valid).invariantErrors).toEqual([]);

    const invalid: TreeState = {
      ...valid,
      modules: [
        ...valid.modules,
        module("illegal-second-successor", "o4", "axis-4", "continuation", 4, 1002),
      ],
    };
    expect(
      diagnoseTree(invalid).invariantErrors.some((error) =>
        error.includes("more than one successor child"),
      ),
    ).toBe(true);
  });
});
