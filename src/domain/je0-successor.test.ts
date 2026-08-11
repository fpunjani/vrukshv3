import { describe, expect, it } from "vitest";
import { diagnoseTree } from "./diagnostics";
import { replayEntries } from "./growth";
import type { Entry } from "./types";

function entries(count: number): Entry[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `je0-${index + 1}`,
    text: `JE0 ${index + 1}`,
    createdAt: index + 1,
    status: "open" as const,
  }));
}

describe("JE0 sympodial successor semantics", () => {
  it("gives every structural parent at most one continuation-or-renewal successor", () => {
    // One mature representative organism is sufficient for this relation-level
    // regression. Multi-soul/lifetime behavior is exercised by the dedicated
    // JE0/JE1 frontier and spatial measurement gates rather than duplicated here.
    const state = replayEntries("ash-01", entries(3000));
    expect(diagnoseTree(state).invariantErrors).toEqual([]);

    let renewalCount = 0;
    const successors = new Map<string, string[]>();
    const moduleById = new Map(state.modules.map((module) => [module.id, module]));

    for (const module of state.modules) {
      if (!module.parentId) continue;
      if (module.relation === "continuation" || module.relation === "renewal") {
        const list = successors.get(module.parentId) ?? [];
        list.push(module.relation);
        successors.set(module.parentId, list);
      }
      if (module.relation === "renewal") {
        renewalCount += 1;
        expect(module.bornAtEvent).toBeGreaterThan(1000);
        expect(module.order).toBe(4);
        const parent = moduleById.get(module.parentId);
        expect(parent?.order).toBe(4);
        expect(module.axisId).not.toBe(parent?.axisId);
      }
    }

    for (const relations of successors.values()) {
      expect(relations).toHaveLength(1);
    }

    for (const module of state.modules.filter((candidate) => candidate.bornAtEvent <= 1000)) {
      expect(module.restDepth).toBe(0);
      expect(module.relation).not.toBe("renewal");
    }

    expect(renewalCount).toBeGreaterThan(0);
  }, 10_000);
});
