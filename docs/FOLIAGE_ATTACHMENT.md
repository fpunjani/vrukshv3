# V3 Foliage Attachment Policy

This document describes the first implementation of the binding rules in `FOLIAGE_CONSTITUTION.md`.

It is intentionally an **attachment system**, not a leaf renderer.

## What is stored

Each `LeafIdentity` now owns:

```ts
attachment: {
  moduleId: string;
  position: number;
  side: -1 | 1;
}
```

These are historical/topological facts.

The attachment does not store world coordinates, curve controls, leaf silhouette, size, rotation, color, season, or motion.

## Event order

For accepted entry N:

1. Check duplicate identity.
2. Increment the growth event.
3. Let the structural engine decide whether event N creates new wood.
4. Build the event's resulting module list.
5. Choose one foliage host from wood whose `bornAtEvent <= N`.
6. Persist the new entry identity and attachment.
7. Never revisit earlier attachments during later entries.

Wood born during event N is therefore eligible for event N's foliage identity. Future wood is impossible to reference.

## Host selection

Only the **new** identity is scored.

Eligible modules receive a score from a small set of derived signals:

- branch-order preference;
- whether the module is currently terminal;
- whether the module was born in the same event;
- module recency;
- existing historical load on that module;
- existing historical load on that axis;
- small soul/entry/module-keyed deterministic variation.

The current order tendency mildly prefers foliage-bearing branch orders over the trunk, without banning trunk foliage or encoding a species-specific canopy formula.

Load penalties are logarithmic. They reduce pathological concentration but do not impose a finite capacity or make old foliage move elsewhere.

## Local anchor

The first prototype considered multiple candidate anchor positions for every module and rescanned all previous foliage to score spacing.

That was rejected before merge for two reasons:

1. it turned attachment into a miniature visual packing engine rather than a historical assignment rule;
2. it made long-history multi-soul QA unnecessarily expensive.

The accepted candidate uses a deterministic low-discrepancy sequence instead.

For the chosen host module:

- a stable soul+module phase is derived;
- the module's current historical foliage load advances through a golden-ratio sequence;
- the sequence maps into the allowed local interval `[0.18, 0.92)`;
- side is derived deterministically from soul + entry + module.

This gives new attachments distributed local positions in O(1) after host selection, without moving previous attachments and without a finite slot table.

## Complexity

Per accepted entry, foliage assignment performs approximately:

- one pass over modules to derive child/module metadata;
- one pass over existing foliage to derive current module/axis load;
- one pass over eligible modules to select the host;
- O(1) local anchor assignment.

There is no all-leaves × all-modules × all-anchor packing pass.

## Derived debug projection

`foliage-geometry.ts` projects historical attachment into the current cubic wood renderer.

For each identity it derives:

- the cubic point at local `position`;
- local tangent and normal;
- current wood thickness;
- a small side-aware offset outside the wood.

Tree Lab can render this as a tiny neutral line + dot using `?attachments=1`.

These debug marks are not leaves. They are deliberately unattractive so attachment quality can be judged without canopy art.

## Automated invariants

The checkpoint tests currently require:

- 1,000 accepted entries -> 1,000 unique identities with valid attachments;
- every host exists;
- no leaf references future wood;
- local positions remain within the defined interval;
- side is valid;
- 299 -> 300 preserves the first 299 identities/attachments byte-for-byte;
- status transitions preserve attachment;
- replay is deterministic;
- soul can alter attachment pattern without altering identity count;
- duplicate entry IDs remain idempotent.

A separate multi-soul distribution gate rejects broad pathologies such as:

- most modules/axes never receiving attachment history;
- one module or axis holding an extreme fraction of identities;
- excessive trunk concentration;
- severe left/right-side collapse.

Those bounds are intentionally broad. The browser attachment matrix remains responsible for finer visual judgment.

## What is not solved yet

This implementation does not decide:

- final leaf shape;
- how large a leaf should be;
- how attachment becomes petiole/stem geometry;
- exact phyllotaxis or species simulation;
- open/completed/archived visual treatment;
- season;
- motion;
- production LOD;
- cluster rendering.

Those remain downstream of attachment acceptance.
