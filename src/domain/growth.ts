import { chooseLeafAttachment } from "./foliage";
import { growStructuralEvent } from "./structure";
import type { Entry, EntryStatus, LeafIdentity, TreeState } from "./types";

export function createTree(soul: string): TreeState {
  return { schemaVersion: 2, soul, growthIndex: 0, modules: [], leaves: [] };
}

function nextLeaf(
  state: TreeState,
  entry: Entry,
  eventIndex: number,
  modules: TreeState["modules"],
): LeafIdentity {
  return {
    entryId: entry.id,
    bornAtEvent: eventIndex,
    createdAt: entry.createdAt,
    status: entry.status,
    attachment: chooseLeafAttachment(
      state,
      modules,
      eventIndex,
      entry.id,
    ),
  };
}

export function applyEntry(previous: TreeState, entry: Entry): TreeState {
  const latestLeaf = previous.leaves[previous.leaves.length - 1];
  // The live append path only needs to make an immediate retry idempotent.
  // Durable storage must enforce entry IDs as unique keys; canonical replay
  // performs full-history de-duplication before rebuilding the organism.
  if (latestLeaf?.entryId === entry.id) return previous;

  if (latestLeaf && entry.createdAt < latestLeaf.createdAt) {
    throw new Error(
      `Historical entry ${entry.id} predates the current tree tip; replay the canonical history instead`,
    );
  }

  const eventIndex = previous.growthIndex + 1;
  const module = growStructuralEvent(previous, eventIndex);
  const modules = module ? [...previous.modules, module] : previous.modules;
  const leaf = nextLeaf(previous, entry, eventIndex, modules);

  return {
    ...previous,
    growthIndex: eventIndex,
    modules,
    leaves: [...previous.leaves, leaf],
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
  const sorted = [...entries].sort(
    (a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id),
  );
  const seen = new Set<string>();
  return sorted.filter((entry) => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  });
}

export function replayEntries(
  soul: string,
  entries: readonly Entry[],
): TreeState {
  // Replay is an internal reconstruction operation, so it may build one local
  // state mutably instead of allocating every intermediate immutable prefix.
  // The returned TreeState is still the same deterministic append-only history.
  const state = createTree(soul);

  for (const entry of canonicalEntries(entries)) {
    const eventIndex = state.growthIndex + 1;
    const module = growStructuralEvent(state, eventIndex);
    if (module) state.modules.push(module);
    const leaf = nextLeaf(state, entry, eventIndex, state.modules);
    state.growthIndex = eventIndex;
    state.leaves.push(leaf);
  }

  return state;
}
