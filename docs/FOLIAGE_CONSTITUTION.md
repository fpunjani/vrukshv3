# V3 Foliage Constitution

**Status:** binding design contract for the foliage checkpoint  
**Scope:** identity, attachment, state semantics, and level-of-detail  
**Rendering status:** no attractive leaf art is approved by this document

Vruksh already guarantees that every accepted entry has a permanent identity and that structural wood is one persistent organism rather than a regenerated chart.

Foliage must preserve that promise.

The purpose of this document is to answer one question before leaf rendering begins:

> What does one entry permanently own in the tree, and what is allowed to change around it?

---

## 1. One accepted entry owns one permanent foliage identity

Every accepted entry creates exactly one permanent foliage identity.

That identity is not a score, reward token, recent-activity decoration, or disposable renderer particle.

It belongs to that entry for the lifetime of the tree.

The identity must survive:

- later entries;
- completion;
- reopening;
- archiving;
- inactivity;
- season changes;
- renderer changes;
- level-of-detail changes;
- branch thickening or curved-geometry improvements;
- ordinary schema migrations.

Deleting an entry is a separate product/data decision and is not defined by this checkpoint.

---

## 2. Identity and visibility are different promises

Permanent identity does **not** mean every leaf must always be drawn as one separate full-size shape.

A 5-year tree may contain thousands of entry identities. A winter presentation may intentionally show very few visible leaves. A mobile thumbnail may not have enough pixels to display 3,000 separate leaf silhouettes.

The domain must therefore distinguish:

1. **Existence** — the entry still owns a foliage identity.
2. **Attachment** — that identity still belongs to a stable place in the organism.
3. **Representation** — the current renderer decides how that identity is expressed at this scale, season, and state.

A renderer may aggregate representation. It may not aggregate away existence.

---

## 3. Topological attachment is historical

Once foliage is attached, the attachment is part of the tree's history.

A foliage identity must remember at least:

- which persistent growth module hosts it;
- where along that module it is attached in local/rest coordinates;
- which side of the module it belongs to.

This is deliberately less than storing final drawing geometry.

### Historical attachment owns

- host growth-module identity;
- local anchor position along that module;
- local side/orientation class;
- birth chronology.

### Historical attachment does **not** own

- current world-space `x/y` coordinates;
- cubic Bézier controls;
- exact screen rotation;
- leaf width/height;
- leaf silhouette;
- color;
- vein pattern;
- opacity;
- wind transform;
- season treatment;
- level-of-detail representation.

Those remain derived.

This gives Vruksh the continuity we want:

> A branch may thicken, curve, sag, or be rendered differently, and the same leaf travels with the same branch because its attachment is local to persistent wood.

---

## 4. Existing foliage may not be re-hosted by later growth

When entry N+1 arrives, it may add new wood and a new foliage identity.

It may **not** move entry N's foliage onto a newer or more attractive branch.

An old foliage identity can move on screen only because its host wood's derived geometry moved.

It cannot move because a later attachment algorithm decided it would look prettier elsewhere.

This is the foliage equivalent of the structural append-only invariant.

---

## 5. A foliage identity may only attach to wood that already exists at its birth

A leaf cannot historically attach to a branch born in its future.

For every foliage identity:

`hostModule.bornAtEvent <= foliage.bornAtEvent`

If a structural module is created during the same accepted entry, that new module is eligible because both belong to the same growth event.

This rule must remain testable from `TreeState` alone.

---

## 6. Attachment is not the same as structural growth

Every entry creates foliage identity.

Not every entry creates structural wood.

Therefore foliage assignment must work when:

- the entry also creates a new structural module;
- no structural module is created;
- the tree is young;
- the tree is mature;
- many existing modules already contain foliage identities.

The structural engine decides whether new wood is born.

The foliage attachment policy decides where the new entry belongs among eligible existing wood.

Neither system is allowed to fabricate the other's history after the fact.

---

## 7. Attachment should follow living growth, not fill a decorative grid

A foliage policy should generally favor biologically plausible living regions of the tree while still allowing a tree to accumulate memory across years.

Useful signals may include:

- branch order;
- terminal versus interior wood;
- module age;
- local foliage load;
- crown occupancy;
- nearby attachment spacing;
- soul-specific tendency;
- the structural event that was just created.

The policy must not become a renderer-side packing algorithm that constantly redistributes all leaves for a prettier silhouette.

Only the new identity is assigned on each event.

---

## 8. A host module needs finite visual capacity, not finite identity capacity

A historical module may accumulate many identities over years.

The domain must not throw identities away because a branch has reached some arbitrary visible-leaf cap.

However, the renderer does not have to draw every identity as a full-size separate leaf at every zoom level.

This distinction is essential:

- **Domain capacity:** identities are not capped.
- **Presentation capacity:** renderer may use clustering, smaller marks, occlusion, or representative groups.

Do not encode a permanent `maxLeavesPerBranch` that silently discards or reassigns history.

---

## 9. Entry status changes expression, not worth

Current entry states are:

- `open`
- `completed`
- `archived`

Status is categorical expression, not a moral or growth score.

### Open

An open entry is fully part of the tree. It must not look sick, defective, faded, or undeserving merely because it is unfinished.

### Completed

Completion may change expression, detail, motion, accent, flowering relationship, or another reversible presentation property.

It must not imply that a completed leaf is a more valuable historical identity than an open leaf.

### Archived

Archiving changes interaction/presentation state. It does not detach, erase, shrink the tree's historical worth, or free a slot for a newer entry.

A renderer may make archived foliage quieter at some scales, but the identity and attachment remain.

### Reopening

Reopening must not create a new foliage identity or move the old one.

It changes the same identity's status.

---

## 10. Inactivity cannot erase foliage history

Stopping logging does not cause earned foliage identities to disappear from the domain.

Dormancy may alter the living presentation of the tree later, but it cannot:

- delete identities;
- detach identities;
- re-host old identities;
- punish the user by permanently stripping their history.

Returning after inactivity continues the same organism.

---

## 11. Season is reversible presentation

A future season system may alter visible foliage abundance dramatically.

For example, a winter rendering may choose not to draw many individual leaves.

That does not mean those identities stopped existing or lost attachment.

Season may influence:

- visible leaf abundance;
- leaf color;
- flowers;
- buds;
- temporary fall/drop representation;
- atmosphere and motion.

Season may not rewrite:

- foliage identity;
- host module;
- local anchor;
- birth event;
- entry status;
- structural topology.

---

## 12. Level-of-detail must be identity-preserving

Vruksh must remain usable from a small mobile card to a large detailed Tree Lab view.

The renderer may choose different representation levels.

A future LOD system may use:

- one full leaf per identity at close range;
- smaller simplified leaves at medium range;
- clustered leaf masses at far range;
- hidden/occluded identities that become inspectable on interaction;
- count-aware representative marks.

The renderer must be able to explain which identities a cluster represents.

A cluster is a view of identities, not a replacement for them.

---

## 13. Exact appearance remains derived

A foliage identity should be recognizable as belonging to the same organism without storing every artistic property forever.

Appearance may be deterministically derived from stable inputs such as:

- soul;
- entry identity;
- host-module identity;
- local attachment;
- entry status;
- season;
- calendar age;
- viewport/LOD.

The renderer may evolve without rewriting foliage history.

If an appearance algorithm changes, the domain identity and attachment remain stable even if the artistic depiction improves.

---

## 14. Foliage must not rescue weak wood

The plain skeleton checkpoint has already passed.

That rule remains binding:

- do not use dense leaves to hide ugly branch junctions;
- do not use canopy blobs to hide ray-like axes;
- do not use flowers to distract from bad attachment density;
- do not use grain/atmosphere to soften obvious placement artifacts.

Foliage quality is judged on top of visible, inspectable wood.

---

## 15. Required domain invariants before leaf art

Before attractive leaf rendering begins, automated tests must prove:

1. Every accepted entry has exactly one foliage identity.
2. Every foliage identity has exactly one valid historical attachment.
3. Every attachment references an existing persistent growth module.
4. The host module was born no later than the foliage identity.
5. Local anchor coordinates are finite and inside their defined domain.
6. Local side/orientation is valid.
7. Adding entry N+1 does not alter the first N foliage identities or attachments.
8. Updating status does not change attachment.
9. Replay with the same soul/history reproduces identical attachments.
10. Different souls may produce different attachment patterns without changing identity count.
11. A 1,000-entry history retains 1,000 identities and 1,000 attachments.
12. Attachment load is not pathologically concentrated on one module/axis across the regression set.

---

## 16. Required visual diagnostic before leaf art

Before drawing final leaves, Tree Lab should first render attachment **debug marks**, not decorative foliage.

The diagnostic should make it easy to inspect:

- host module;
- local anchor;
- side;
- entry status;
- local load;
- attachment age;
- attachment distribution by axis/order;
- the same organism at 30 / 100 / 300 / 1000 entries.

Use neutral dots/ticks or another intentionally unattractive representation.

If attachment looks like a grid, clumps into a few branches, floats off wood, or jumps between milestones, fix the attachment policy before leaf shapes are introduced.

---

## 17. What is explicitly out of scope for this contract

This document does not yet approve:

- final leaf silhouettes;
- botanical species choice;
- leaf palette;
- flowers;
- fruit;
- falling leaves;
- season implementation;
- wind animation;
- particle effects;
- bark art;
- production LOD implementation;
- persistence/backend schema;
- product UI.

Those follow only after attachment semantics are proven.

---

## 18. Checkpoint exit criteria

The foliage-contract checkpoint passes when:

- persistent attachment semantics are represented in the domain;
- deterministic assignment exists;
- all invariants above pass across long histories and many souls;
- neutral Tree Lab attachment marks demonstrate stable, distributed attachment at shared scale;
- existing skeleton/crown/mechanics gates remain green;
- no attractive foliage has been used to influence the verdict.

Only then should Vruksh begin actual leaf design and rendering.
