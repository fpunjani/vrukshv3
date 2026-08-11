import { describe, expect, it } from "vitest";
import { replayEntries } from "./growth";
import { deriveScaffoldBalancedMeristemFrontier } from "./mature-meristem-frontier";
import type { Entry } from "./types";

function entries(count: number): Entry[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `meristem-${index + 1}`,
    text: `Meristem ${index + 1}`,
    createdAt: index + 1,
    status: "open" as const,
  }));
}

describe("scaffold-balanced mature meristem frontier", () => {
  it("preserves the recent frontier and adds only bounded scaffold reserves", () => {
    for (const soul of ["ash-01", "ash-02", "ash-03", "ash-04"]) {
      const state = replayEntries(soul, entries(3000));
      const frontier = deriveScaffoldBalancedMeristemFrontier(state.modules);
      const again = deriveScaffoldBalancedMeristemFrontier(state.modules);

      expect([...again.selectedTipIds]).toEqual([...frontier.selectedTipIds]);
      expect(frontier.acceptedScaffoldAxes.length).toBeGreaterThanOrEqual(2);

      for (const id of frontier.recentTipIds) {
        expect(frontier.selectedTipIds.has(id)).toBe(true);
      }
      for (const id of frontier.reserveTipIds) {
        expect(frontier.recentTipIds.has(id)).toBe(false);
        expect(frontier.livingTipIds.has(id)).toBe(true);
      }

      for (const axis of frontier.acceptedScaffoldAxes) {
        const living = frontier.livingByScaffold.get(axis)?.length ?? 0;
        const selected = frontier.selectedByScaffold.get(axis)?.length ?? 0;
        expect(selected).toBeGreaterThanOrEqual(Math.min(4, living));
        expect(selected).toBeLessThanOrEqual(living);
      }

      expect(frontier.selectedTipIds.size).toBeLessThanOrEqual(
        frontier.recentTipIds.size + frontier.acceptedScaffoldAxes.length * 4,
      );
    }
  }, 20_000);
});
