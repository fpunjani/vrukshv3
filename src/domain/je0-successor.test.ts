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
    let renewalCount = 0;
    for (const soul of ["ash-01", "ash-02", "ash-03", "ash-04"]) {
      const state = replayEntries(soul, entries(3000));
      expect(diagnoseTree(state).invariantErrors).toEqual([]);

      const successors = new Map<string, string[]>();
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
          const parent = state.modules.find((candidate) => candidate.id === module.parentId);
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
    }
    expect(renewalCount).toBeGreaterThan(0);
  }, 20_000);
});
