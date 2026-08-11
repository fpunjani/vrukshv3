import { chooseLeafAttachment } from "./foliage";
import { compareStableStrings } from "./stable-order";
import { growStructuralEvent } from "./structure";
import type { Entry, EntryStatus, LeafIdentity, TreeState } from "./types";

const VISUAL_STRUCTURE_HORIZON = 1000;
const MATURE_STRUCTURAL_INTERVAL = 12;
const BASE_MATURE_OPPORTUNITY = Math.floor(
  VISUAL_STRUCTURE_HORIZON / MATURE_STRUCTURAL_INTERVAL,
);
const MATURE_GROWTH_SCALE = 2 * Math.sqrt(BASE_MATURE_OPPORTUNITY);

export function createTree(soul: string): TreeState {
  return { schemaVersion: 2, soul, growthIndex: 0, modules: [], leaves: [] };
}

function compareChronology(
  aCreatedAt: number,
  aId: string,
  bCreatedAt: number,
  bId: string,
): number {
  return aCreatedAt - bCreatedAt || compareStableStrings(aId, bId);
}

function matureOpportunityCount(opportunity: number): number {
  if (opportunity <= BASE_MATURE_OPPORTUNITY) return 0;
  return Math.floor(
    MATURE_GROWTH_SCALE *
      (Math.sqrt(opportunity) - Math.sqrt(BASE_MATURE_OPPORTUNITY)),
  );
}

export function shouldAttemptStructuralGrowth(eventIndex: number): boolean {
  // Preserve the accepted visual-development tree exactly through 1000 entries.
  // Beyond that point the existing structural engine only grows on every 12th
  // event. Select a square-root subset of those mature opportunities so wood
  // keeps accumulating for life without becoming linear in entry count.
  if (eventIndex <= VISUAL_STRUCTURE_HORIZON) return true;
  if (eventIndex % MATURE_STRUCTURAL_INTERVAL !== 0) return false;

  const opportunity = Math.floor(eventIndex / MATURE_STRUCTURAL_INTERVAL);
  return (
    matureOpportunityCount(opportunity) >
    matureOpportunityCount(opportunity - 1)
  );
}

function structuralModule(
  state: TreeState,
  eventIndex: number,
): ReturnType<typeof growStructuralEvent> {
  return shouldAttemptStructuralGrowth(eventIndex)
    ? growStructuralEvent(state, eventIndex)
    : null;
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
  // Domain-level idempotency is deliberately stronger than the future storage
  // constraint. A retry of any previously accepted ID must never manufacture a
  // second historical identity, even if the retry is not the current tip.
  if (previous.leaves.some((leaf) => leaf.entryId === entry.id)) return previous;

  const latestLeaf = previous.leaves[previous.leaves.length - 1];
  if (
    latestLeaf &&
    compareChronology(
      entry.createdAt,
      entry.id,
      latestLeaf.createdAt,
      latestLeaf.entryId,
    ) < 0
  ) {
    throw new Error(
      `Historical entry ${entry.id} predates the current tree tip in canonical order; replay the canonical history instead`,
    );
  }

  const eventIndex = previous.growthIndex + 1;
  const module = structuralModule(previous, eventIndex);
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
  const sorted = [...entries].sort((a, b) =>
    compareChronology(a.createdAt, a.id, b.createdAt, b.id),
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
    const module = structuralModule(state, eventIndex);
    if (module) state.modules.push(module);
    const leaf = nextLeaf(state, entry, eventIndex, state.modules);
    state.growthIndex = eventIndex;
    state.leaves.push(leaf);
  }

  return state;
}
