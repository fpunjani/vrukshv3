# V3 Foliage Constitution

**Status:** binding design contract for the foliage checkpoint  
**Scope:** identity, attachment, state semantics, longevity, and level-of-detail  
**Rendering status:** no attractive leaf art is approved by this document

Vruksh guarantees that every accepted entry has a permanent identity and that structural wood is one persistent organism rather than a regenerated chart. Foliage must preserve that promise.

## Core invariants

1. **One accepted entry owns one permanent foliage identity.** It is not a score, reward token, recent-activity decoration, or disposable renderer particle.
2. **Identity and visibility are different promises.** A foliage identity can exist even when season, occlusion, or level-of-detail means it is not drawn as one full leaf.
3. **Topological attachment is historical.** The identity remembers its persistent host growth module, local anchor along that module, local side, and birth chronology.
4. **World-space art remains derived.** Final `x/y`, curves, rotation, silhouette, size, color, veins, opacity, motion, season, and LOD representation are not historical state.
5. **Existing foliage may not be re-hosted by later growth.** Entry N+1 may add a new identity; it may not move entry N to prettier wood.
6. **A leaf may only attach to wood that exists at its birth.** `hostModule.bornAtEvent <= leaf.bornAtEvent`. Wood born in the same accepted event is eligible.
7. **Every entry creates foliage; not every entry creates wood.** Foliage assignment must work whether or not that event creates a structural module.
8. **Attachment follows the organism, not a decorative grid.** Only the new identity is assigned on each event. The policy may consider branch order, terminal wood, age, crown development, and soul, but it may not globally repack old leaves.
9. **Domain identity is uncapped.** A module can own many historical identities over years. Presentation may cluster them at low detail; the domain may not throw them away because a branch reached a visual cap.
10. **Entry status changes expression, not worth.** Open, completed, archived, and reopened states keep the same identity and attachment.
11. **Inactivity cannot erase foliage history.** Dormancy may change presentation later, never permanent identity or attachment.
12. **Season is reversible presentation.** Winter may visually suppress leaves; it may not alter identity, attachment, entry status, or wood topology.
13. **LOD must preserve identity.** A cluster represents known identities; it does not replace them. Close/medium/far renderers may differ while the domain remains complete.
14. **Foliage may not rescue weak wood.** Dense leaves, flowers, grain, or atmosphere are not allowed to hide structural defects.
15. **There is no maximum-entry constant in the domain.** QA milestones are tests, not lifetime caps.

## Historical attachment model

A foliage identity permanently owns at least:

- `moduleId` — the persistent growth module hosting the identity;
- `position` — a finite normalized local coordinate along that module;
- `side` — a stable local side/orientation class;
- the identity's existing `bornAtEvent` and `createdAt` chronology.

The current 2D model uses `side = -1 | 1`. A future renderer may interpret that visually in richer ways without rewriting attachment history.

The local anchor is historical because it determines where the identity belongs on persistent wood. World coordinates are not historical: if the branch curves, thickens, sags, or receives a better renderer, the same attachment moves with it.

## Status semantics

Open, completed, archived, and reopened entries all remain fully part of the organism. Status may alter reversible presentation later, but must never create a new identity, move an attachment, erase history, or imply greater historical worth.

## Level-of-detail contract

A long-lived tree may contain thousands or tens of thousands of identities. The renderer may later use:

- one full leaf per identity at close range;
- simplified leaves at medium range;
- clustered foliage masses at far range;
- occlusion or representative marks;
- seasonally hidden representations.

Every aggregate representation must remain traceable to the identities it represents. Domain capacity is unlimited by visual density; presentation capacity is a renderer concern.

## Required automated invariants before leaf art

Before attractive leaves begin, tests must prove:

1. Every accepted entry has exactly one foliage identity.
2. Every foliage identity has exactly one valid attachment.
3. Every attachment references an existing persistent growth module.
4. The host module was born no later than the identity.
5. `position` is finite and inside its defined domain.
6. `side` is valid.
7. Entry N+1 leaves the first N identities and attachments byte-for-byte unchanged.
8. Status updates do not alter attachment.
9. Replay with the same soul/history reproduces identical attachment history.
10. Different souls may produce different attachment patterns without changing identity count.
11. A 1,000-entry history retains exactly 1,000 identities and attachments and remains the primary visual-development milestone.
12. Attachment load is not pathologically concentrated on one module or axis across the regression set.
13. Existing skeleton/crown/mechanics gates remain green.
14. Long-life QA must remain valid at 3,000, 10,000, and 30,000 entries, with entry 30,001 extending—not rewriting—the same organism.
15. Long-history wood growth remains sublinear relative to entry count.

The 30,000-entry checkpoint is deliberately only a current stress target. Passing it does not create a maximum; future stress gates can move higher without changing identity semantics.

## Required visual diagnostic before leaf art

Tree Lab must first render intentionally plain attachment debug marks, not decorative leaves.

The diagnostic should expose host module, local anchor, side, status, attachment age, and the same organism at 30 / 100 / 300 / 1000 entries.

If marks look like a grid, clump onto a few limbs, float away from wood, or jump between milestones, the attachment policy fails even if final leaf art could hide it.

The visual lab intentionally stops at 1,000 until a production LOD renderer exists. Larger histories are validated as domain longevity tests, not by attempting to draw every identity at once.

## Out of scope

This checkpoint does not approve final leaf silhouettes, species, palette, flowers, fruit, seasons, falling leaves, wind, particles, bark art, production LOD, backend persistence, or product UI.

## Exit criteria

The foliage-contract checkpoint passes when persistent attachment is represented in schema V2, deterministic assignment passes both visual-scale and long-history invariants, neutral Tree Lab marks show stable distributed attachment at shared scale, and the accepted wood skeleton remains green.

Only then should Vruksh begin actual leaf design.
