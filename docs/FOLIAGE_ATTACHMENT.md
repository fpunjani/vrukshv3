# V3 Foliage Attachment Policy

This document describes the first implementation of the binding rules in `FOLIAGE_CONSTITUTION.md`.

It is intentionally an **attachment system**, not a leaf renderer.

## Schema boundary

Foliage attachment changes durable history, so the tree schema is now **version 2**.

Each `LeafIdentity` owns:

```ts
attachment: {
  moduleId: string;
  position: number;
  side: -1 | 1;
}
```

These are historical/topological facts. World coordinates, curve controls, leaf silhouette, size, rotation, color, season, and motion remain derived.

## Event order

For accepted entry N:

1. Reject historical insertion into the live tip path; an immediate retry of the tip ID is idempotent.
2. Increment the growth event.
3. Let the structural engine decide whether event N creates new wood.
4. Build the event's resulting module list.
5. Choose one foliage host from wood whose `bornAtEvent <= N`.
6. Persist the new entry identity and attachment.
7. Never revisit earlier attachments during later entries.

Wood born during event N is eligible for event N's foliage identity. Future wood is impossible to reference.

Canonical replay globally de-duplicates entry IDs before rebuilding. Durable storage is expected to enforce entry IDs as unique keys when persistence is introduced.

## Host selection

Only the **new** identity is scored. No previous foliage is scanned or repacked.

Eligible modules receive a score from:

- branch-order preference;
- whether the module is currently terminal;
- whether the module was born in the same event;
- module recency;
- entry × module × soul deterministic rendezvous variation.

The current order tendency prefers foliage-bearing branch orders over the trunk without banning trunk foliage or encoding a species-specific canopy formula.

The rendezvous component changes for every entry, so similarly suitable pieces of wood compete independently across history. This spreads identities without a persistent load table and without making assignment slower merely because more leaves already exist.

## Local anchor

The first prototype considered multiple candidate anchor positions for every module and rescanned previous foliage to score spacing. A second prototype used historical load to advance a low-discrepancy local sequence.

Both were rejected before merge because attachment should not become a visual packing engine or become more expensive as leaf history grows.

The accepted policy derives `position` and `side` directly from soul + entry + chosen module:

- `position` is deterministic inside `[0.18, 0.92]`;
- `side` is deterministic `-1 | 1`;
- old attachments never participate in a new assignment;
- there is no finite slot table and no global repacking.

## Complexity

Per accepted entry, foliage assignment performs approximately:

- one pass over structural modules to derive child metadata;
- one pass over eligible modules to select the host;
- O(1) local anchor assignment.

Its work depends on current wood complexity, **not on the number of historical foliage identities**.

Canonical replay uses one internal mutable reconstruction buffer so loading a long history does not allocate every intermediate immutable prefix. The returned `TreeState` remains deterministic and append-only.

## Derived debug projection

`foliage-geometry.ts` projects historical attachment into the current cubic wood renderer.

For each identity it derives the cubic anchor, local tangent/normal, current wood thickness, and a small side-aware offset. Tree Lab can render this as a tiny neutral line + dot using `?attachments=1`.

These marks are not leaves. They are deliberately unattractive so attachment quality can be judged without canopy art.

## Automated invariants

The checkpoint requires:

- 1,000 accepted entries -> 1,000 unique identities with valid attachments;
- every host exists and was born no later than its identity;
- local position/side validity;
- append-only identity, attachment, and module prefixes;
- status transitions preserve attachment;
- replay is deterministic;
- soul can alter attachment pattern without altering identity count;
- immediate duplicate retry is idempotent and canonical replay de-duplicates IDs;
- broad multi-soul concentration limits;
- all accepted skeleton/crown gates remain green.

## Long-life gate

**1,000 is a visual-development milestone, not a product limit.**

The non-visual longevity test reconstructs the same soul at **3,000, 10,000, and 30,000 entries**, then appends entry 30,001. It checks that:

- identity count remains exact;
- every historical attachment still references valid non-future wood;
- old identity/module prefixes remain byte-for-byte unchanged;
- structural wood continues to grow but stays far below one branch per entry;
- foliage does not collapse onto one module, axis, trunk, or side;
- a new live append does not rewrite the 30,000-entry history.

There is intentionally no maximum-entry constant in the domain contract.

## What is not solved yet

This implementation does not decide final leaf shape, leaf size, petiole geometry, exact phyllotaxis/species simulation, status art, season, motion, production LOD, or cluster rendering.

Those remain downstream of attachment acceptance.
