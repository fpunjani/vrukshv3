import { describe, expect, it } from "vitest";
import { applyEntry, createTree, replayEntries, updateEntryStatus } from "./growth";
import type { Entry, TreeState } from "./types";

function entries(count: number): Entry[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `entry-${index + 1}`,
    text: `Entry ${index + 1}`,
    createdAt: Date.UTC(2026, 0, 1) + index * 86_400_000,
    status: "open" as const,
  }));
}

function validateAttachments(state: TreeState): string[] {
  const errors: string[] = [];
  const moduleById = new Map(state.modules.map((module) => [module.id, module]));

  for (const leaf of state.leaves) {
    const host = moduleById.get(leaf.attachment.moduleId);
    if (!host) {
      errors.push(`${leaf.entryId}: missing host ${leaf.attachment.moduleId}`);
      continue;
    }
    if (host.bornAtEvent > leaf.bornAtEvent) {
      errors.push(`${leaf.entryId}: attached to future wood`);
    }
    if (!Number.isFinite(leaf.attachment.position)) {
      errors.push(`${leaf.entryId}: non-finite position`);
    }
    if (leaf.attachment.position < 0.16 || leaf.attachment.position > 0.94) {
      errors.push(`${leaf.entryId}: position outside attachment domain`);
    }
    if (leaf.attachment.side !== -1 && leaf.attachment.side !== 1) {
      errors.push(`${leaf.entryId}: invalid side`);
    }
  }

  return errors;
}

describe("V3 foliage identity and attachment contract", () => {
  it(
    "gives every accepted entry exactly one valid permanent attachment through 1000 entries",
    () => {
      const state = replayEntries("foliage-contract", entries(1000));

      expect(state.leaves).toHaveLength(1000);
      expect(new Set(state.leaves.map((leaf) => leaf.entryId)).size).toBe(1000);
      expect(validateAttachments(state)).toEqual([]);
    },
    15_000,
  );

  it("keeps all prior foliage identities and attachments byte-for-byte append-only", () => {
    const history = entries(300);
    const before = replayEntries("foliage-append", history.slice(0, 299));
    const after = applyEntry(before, history[299]);

    expect(after.leaves.slice(0, before.leaves.length)).toEqual(before.leaves);
    expect(after.modules.slice(0, before.modules.length)).toEqual(before.modules);
    expect(after.leaves).toHaveLength(before.leaves.length + 1);
  });

  it("changes entry status without moving its foliage attachment", () => {
    const state = replayEntries("foliage-status", entries(120));
    const target = state.leaves[42];
    const beforeAttachments = state.leaves.map((leaf) => leaf.attachment);

    const completed = updateEntryStatus(state, target.entryId, "completed");
    expect(completed.leaves[42].status).toBe("completed");
    expect(completed.leaves.map((leaf) => leaf.attachment)).toEqual(beforeAttachments);

    const archived = updateEntryStatus(completed, target.entryId, "archived");
    expect(archived.leaves[42].status).toBe("archived");
    expect(archived.leaves.map((leaf) => leaf.attachment)).toEqual(beforeAttachments);

    const reopened = updateEntryStatus(archived, target.entryId, "open");
    expect(reopened.leaves[42].status).toBe("open");
    expect(reopened.leaves.map((leaf) => leaf.attachment)).toEqual(beforeAttachments);
  });

  it("replays identical attachment history for the same soul and entries", () => {
    const history = entries(500);
    const first = replayEntries("foliage-determinism", history);
    const second = replayEntries("foliage-determinism", history);

    expect(second).toEqual(first);
  });

  it("allows soul to change attachment pattern without changing identity count", () => {
    const history = entries(200);
    const first = replayEntries("foliage-soul-a", history);
    const second = replayEntries("foliage-soul-b", history);

    expect(first.leaves).toHaveLength(history.length);
    expect(second.leaves).toHaveLength(history.length);
    expect(first.leaves.map((leaf) => leaf.entryId)).toEqual(
      second.leaves.map((leaf) => leaf.entryId),
    );
    expect(first.leaves.map((leaf) => leaf.attachment)).not.toEqual(
      second.leaves.map((leaf) => leaf.attachment),
    );
  });

  it("ignores duplicate entry IDs without creating a second foliage identity", () => {
    const entry = entries(1)[0];
    const first = applyEntry(createTree("foliage-duplicate"), entry);
    const duplicate = applyEntry(first, entry);

    expect(duplicate).toBe(first);
    expect(duplicate.leaves).toHaveLength(1);
  });
});
