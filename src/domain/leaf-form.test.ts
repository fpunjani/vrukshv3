import { describe, expect, it } from "vitest";
import { projectFoliageFrames } from "./foliage-geometry";
import { replayEntries, updateEntryStatus } from "./growth";
import { deriveLeafFamilyTraits, projectLeafForms } from "./leaf-form";
import type { Entry, Point } from "./types";

function entries(count: number): Entry[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `entry-${index + 1}`,
    text: `Entry ${index + 1}`,
    createdAt: index,
    status: "open" as const,
  }));
}

function finite(point: Point): boolean {
  return Number.isFinite(point.x) && Number.isFinite(point.y);
}

function withoutStatus<T extends { status: unknown }>(value: T): Omit<T, "status"> {
  const { status: _status, ...rest } = value;
  return rest;
}

describe("V3 Leaf Form V1", () => {
  it(
    "projects one finite connected leaf form for every identity through 1000 entries",
    () => {
      const state = replayEntries("leaf-form-contract", entries(1000));
      const frames = new Map(
        projectFoliageFrames(state).map((frame) => [frame.entryId, frame]),
      );
      const forms = projectLeafForms(state);

      expect(forms).toHaveLength(state.leaves.length);
      expect(forms).toHaveLength(1000);

      for (const form of forms) {
        const identity = state.leaves.find((leaf) => leaf.entryId === form.entryId);
        const frame = frames.get(form.entryId);
        expect(identity).toBeDefined();
        expect(frame).toBeDefined();
        if (!identity || !frame) continue;

        expect(form.moduleId).toBe(identity.attachment.moduleId);
        expect(form.stemOrigin).toEqual(frame.surface);
        expect(form.side).toBe(identity.attachment.side);
        expect(form.order).toBe(frame.order);

        for (const point of [
          form.stemOrigin,
          form.base,
          form.tip,
          form.leftControl1,
          form.leftControl2,
          form.rightControl1,
          form.rightControl2,
          form.direction,
        ]) {
          expect(finite(point), `${form.entryId} finite geometry`).toBe(true);
        }

        expect(form.length).toBeGreaterThanOrEqual(2.5);
        expect(form.length).toBeLessThanOrEqual(7.1);
        expect(form.width).toBeGreaterThan(0.7);
        expect(form.width).toBeLessThanOrEqual(3.5);
        expect(form.petioleLength).toBeGreaterThan(0.7);
        expect(form.petioleLength).toBeLessThanOrEqual(2.2);

        const sideDot =
          form.direction.x * frame.normal.x + form.direction.y * frame.normal.y;
        expect(sideDot, `${form.entryId} remains on stored side`).toBeGreaterThan(0.3);
      }
    },
    15_000,
  );

  it("is deterministic for the same soul and history", () => {
    const history = entries(300);
    expect(projectLeafForms(replayEntries("leaf-form-repeat", history))).toEqual(
      projectLeafForms(replayEntries("leaf-form-repeat", history)),
    );
  });

  it("derives a coherent family from soul rather than entry history", () => {
    const first = deriveLeafFamilyTraits("leaf-family-a");
    const repeated = deriveLeafFamilyTraits("leaf-family-a");
    const second = deriveLeafFamilyTraits("leaf-family-b");

    expect(repeated).toEqual(first);
    expect(second).not.toEqual(first);
    expect(first.baseLength).toBeGreaterThanOrEqual(4.5);
    expect(first.baseLength).toBeLessThanOrEqual(5.8);
    expect(first.widthRatio).toBeGreaterThanOrEqual(0.32);
    expect(first.widthRatio).toBeLessThanOrEqual(0.44);
  });

  it("does not move or reshape a leaf when entry status changes", () => {
    const state = replayEntries("leaf-form-status", entries(180));
    const target = state.leaves[72];
    const before = new Map(
      projectLeafForms(state).map((form) => [form.entryId, withoutStatus(form)]),
    );

    const completed = updateEntryStatus(state, target.entryId, "completed");
    const archived = updateEntryStatus(completed, target.entryId, "archived");

    expect(
      new Map(
        projectLeafForms(completed).map((form) => [form.entryId, withoutStatus(form)]),
      ),
    ).toEqual(before);
    expect(
      new Map(
        projectLeafForms(archived).map((form) => [form.entryId, withoutStatus(form)]),
      ),
    ).toEqual(before);
  });
});
