import { chooseLeafAttachment } from "./foliage";
import { growStructuralEvent } from "./structure";
import type { Entry, EntryStatus, TreeState } from "./types";

export function createTree(soul: string): TreeState {
  return { schemaVersion: 2, soul, growthIndex: 0, modules: [], leaves: [] };
}

export function applyEntry(previous: TreeState, entry: Entry): TreeState {
  if (previous.leaves.some((leaf) => leaf.entryId === entry.id)) return previous;

  const latestLeaf = previous.leaves[previous.leaves.length - 1];
  if (latestLeaf && entry.createdAt < latestLeaf.createdAt) {
    throw new Error(
      `Historical entry ${entry.id} predates the current tree tip; replay the canonical history instead`,
    );
  }

  const eventIndex = previous.growthIndex + 1;
  const module = growStructuralEvent(previous, eventIndex);
  const modules = module ? [...previous.modules, module] : previous.modules;
  const attachment = chooseLeafAttachment(
    previous,
    modules,
    eventIndex,
    entry.id,
  );

  return {
    ...previous,
    growthIndex: eventIndex,
    modules,
    leaves: [
      ...previous.leaves,
      {
        entryId: entry.id,
        bornAtEvent: eventIndex,
        createdAt: entry.createdAt,
        status: entry.status,
        attachment,
      },
    ],
  };
}

export function updateEntryStatus(
  state: TreeState,
  entryId: string,
  status: EntryStatus,
): TreeState {
  return {
    ...state,
    leaves: state.leaves.map((leaf) =>
      leaf.entryId === entryId ? { ...leaf, status } : leaf,
    ),
  };
}

function canonicalEntries(entries: readonly Entry[]): Entry[] {
  return [...entries].sort(
    (a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id),
  );
}

export function replayEntries(
  soul: string,
  entries: readonly Entry[],
): TreeState {
  return canonicalEntries(entries).reduce(
    (state, entry) => applyEntry(state, entry),
    createTree(soul),
  );
}
