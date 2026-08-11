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
        expect(form.position).toBe(identity.attachment.position);
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

        expect(form.length).toBeGreaterThanOrEqual(2.9);
        expect(form.length).toBeLessThanOrEqual(11.6);
        expect(form.width).toBeGreaterThan(0.35);
        expect(form.width).toBeLessThanOrEqual(5.4);
        expect(form.petioleLength).toBeGreaterThan(0.55);
        expect(form.petioleLength).toBeLessThanOrEqual(2.1);
        expect(form.faceExposure).toBeGreaterThanOrEqual(0.18);
        expect(form.faceExposure).toBeLessThanOrEqual(1);
        expect(form.depth).toBeGreaterThanOrEqual(-1);
        expect(form.depth).toBeLessThanOrEqual(1);

        const sideDot =
          form.direction.x * frame.normal.x + form.direction.y * frame.normal.y;
        expect(sideDot, `${form.entryId} remains on stored side`).toBeGreaterThan(0);
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

  it("keeps intrinsic 2.5D phase stable when future identities arrive", () => {
    const history = entries(1000);
    const at300 = new Map(
      projectLeafForms(replayEntries("leaf-form-phase", history.slice(0, 300))).map(
        (form) => [form.entryId, form],
      ),
    );
    const at1000 = new Map(
      projectLeafForms(replayEntries("leaf-form-phase", history)).map((form) => [
        form.entryId,
        form,
      ]),
    );

    for (const [entryId, earlier] of at300) {
      const later = at1000.get(entryId);
      expect(later, entryId).toBeDefined();
      expect(later?.faceExposure, `${entryId} exposure`).toBe(earlier.faceExposure);
      expect(later?.depth, `${entryId} depth`).toBe(earlier.depth);
    }
  });

  it("derives a coherent family from soul rather than entry history", () => {
    const first = deriveLeafFamilyTraits("leaf-family-a");
    const repeated = deriveLeafFamilyTraits("leaf-family-a");
    const second = deriveLeafFamilyTraits("leaf-family-b");

    expect(repeated).toEqual(first);
    expect(second).not.toEqual(first);
    expect(first.baseLength).toBeGreaterThanOrEqual(7.4);
    expect(first.baseLength).toBeLessThanOrEqual(9.2);
    expect(first.widthRatio).toBeGreaterThanOrEqual(0.32);
    expect(first.widthRatio).toBeLessThanOrEqual(0.43);
    expect(first.forwardBias).toBeGreaterThanOrEqual(0.18);
    expect(first.forwardBias).toBeLessThanOrEqual(0.3);
    expect(first.lightBias).toBeGreaterThanOrEqual(0.025);
    expect(first.lightBias).toBeLessThanOrEqual(0.055);
    expect(first.sagBias).toBeGreaterThanOrEqual(0.045);
    expect(first.sagBias).toBeLessThanOrEqual(0.085);
  });

  it("does not globally force mature foliage upward", () => {
    const souls = ["ash-01", "ash-02", "ash-03", "ash-04", "ash-05", "ash-06", "ash-07", "ash-08"];
    const history = entries(1000);

    for (const soul of souls) {
      const forms = projectLeafForms(replayEntries(soul, history));
      const stronglyUp = forms.filter((form) => form.direction.y < -0.5).length / forms.length;
      const lateralOrDown = forms.filter((form) => form.direction.y >= -0.15).length / forms.length;
      const down = forms.filter((form) => form.direction.y > 0.05).length / forms.length;

      // The exact proportions are not botanical truth; they are broad guards
      // against the previous failure where the renderer made "up" the default
      // posture for almost the entire crown.
      expect(stronglyUp, `${soul} strongly-up fraction`).toBeLessThan(0.78);
      expect(lateralOrDown, `${soul} lateral/down fraction`).toBeGreaterThan(0.16);
      expect(down, `${soul} downward fraction`).toBeGreaterThan(0.035);
    }
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
