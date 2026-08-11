# V3 Canopy Representation + LOD

**Status:** active architecture checkpoint  
**Depends on:** accepted skeleton, foliage attachment, and Leaf Form V1  
**Scope:** deterministic detail levels, stable clustering, traceability, and rendering budgets across long histories

This checkpoint exists because permanent identity is uncapped while screen detail is not.

A 30,000-entry Vruksh must still contain 30,000 permanent foliage identities, but a far or medium view must not require 30,000 full SVG leaf blades.

LOD is therefore a **representation layer**, never a history mutation.

## Binding invariants

1. **Schema V2 does not change.** LOD level, cluster membership, cluster geometry, and render budgets are derived presentation.
2. **No identity is deleted by LOD.** Every permanent leaf identity belongs to exactly one visible representation primitive at a chosen detail level.
3. **Traceability is exact.** A cluster can enumerate or otherwise resolve the exact member entry IDs it represents.
4. **No re-hosting.** Clustering may group identities, but it may not change their permanent host module, local position, or side.
5. **Old bucket assignment is append-stable.** For a fixed detail level, adding newer entries may add members to an existing bucket or create new buckets, but an older identity may not move to a different bucket merely because later history exists.
6. **Bucket assignment cannot depend on current sibling rank, current cluster population, global packing, or current screen-space nearest neighbours.** Those can change when future entries arrive.
7. **Current world geometry may still evolve.** A bucket's present-day projection may move as its underlying accepted wood geometry thickens/curves with age. That is derived mechanics, not historical reassignment.
8. **Detail levels form a deterministic hierarchy.** Close detail may resolve an individual identity; medium and far representations group identities using stable historical/topological keys.
9. **A coarser level may simplify geometry, not semantics.** It may show one canopy mass for many identities, but its membership remains recoverable.
10. **Primitive count must scale with structural/topological complexity, not linearly with entry count at every zoom.**
11. **Leaf Form V1 remains the canonical close-detail form.** LOD is not permission to replace or redefine accepted individual leaf geometry.
12. **No seasons, motion, flowers, final texture, or final palette in this checkpoint.** A cluster must first prove its identity semantics and scale behavior in neutral diagnostic rendering.

## Detail levels

### Close — `individual`

Purpose: inspection and intimate interaction.

Representation:
- one accepted Leaf Form V1 primitive per permanent identity;
- exact entry ID;
- exact historical attachment;
- accepted 2.5D phase/exposure/depth.

This is intentionally O(entries) and is not the default representation for very long histories.

### Medium — `module`

Purpose: normal tree-scale viewing where individual foliage texture is useful but every historical blade is unnecessary.

Stable bucket key:

`moduleId + stored side + stable attachment-position bin`

Position bins are derived only from the identity's immutable normalized attachment position. They do not use current member count.

Properties:
- identities attached to the same historical wood neighbourhood can share one primitive;
- old identity -> medium bucket mapping remains unchanged when future entries arrive;
- the number of possible primitives is bounded by structural module count × sides × fixed bin count.

### Far — `axis`

Purpose: whole-organism / long-history viewing.

Stable bucket key:

`axisId + stored side + stable module-ordinal band`

A module's ordinal within its persistent axis is determined by its historical birth order. Future continuation modules append after it, so an existing module's ordinal never changes.

Properties:
- identities on nearby historical modules of the same axis may share one canopy primitive;
- old identity -> far bucket mapping is append-stable;
- primitive count is bounded by axis/module complexity rather than leaf count.

## Stable hierarchy

The representation hierarchy is:

`entry identity -> medium module bucket -> far axis-band bucket`

Every identity can therefore resolve:

- its individual form;
- its current medium cluster;
- its current far cluster.

The mapping must be deterministic for the same state and remain stable for old identities under append-only history.

## Cluster identity

Cluster IDs are derived keys, not persisted IDs.

A cluster should expose at minimum:

- detail level;
- stable cluster key;
- exact member entry IDs;
- member count;
- representative historical/topological host information;
- deterministic present-day anchor/orientation/depth information for diagnostic rendering.

The visible cluster geometry must not use a global mean position as its sole anchor if that would cause the cluster to drift whenever a new member joins.

Prefer a stable representative derived from the bucket definition or the earliest historical member. Later members may change density/count expression without redefining where the bucket belongs.

## Proposed fixed buckets

Medium V1:
- 4 normalized position bins per module per side.

Far V1:
- 4 persistent modules per axis band per side.

These values are renderer-policy constants, not biological truth. They are deliberately simple enough to test stability before visual tuning.

They may be revised only if visual/budget evidence requires it; revisions are renderer version changes, not history migrations.

## Automated acceptance

At minimum test 1k / 3k / 10k / 30k histories.

For each detail level:

1. **Exact coverage:** union of member IDs equals all permanent identity IDs exactly once.
2. **No duplicates:** an identity belongs to one and only one primitive at that detail level.
3. **Traceability:** every cluster member resolves to an existing `LeafIdentity`.
4. **Attachment integrity:** clustering never mutates the tree or leaf attachment data.
5. **Determinism:** replaying the same soul/history produces identical representation keys and memberships.
6. **Append stability:** for identities present at an earlier checkpoint, their medium/far cluster keys remain identical at later checkpoints.
7. **Nested mapping:** each medium bucket maps to exactly one far bucket.
8. **Close equivalence:** individual detail yields one accepted Leaf Form V1 per identity.
9. **Bounded medium primitives:** medium primitive count is bounded by a fixed multiple of structural modules, independent of raw entry count.
10. **Bounded far primitives:** far primitive count is more compact than medium and bounded by axis/module topology.
11. **Long-history practicality:** 30k representation construction must complete inside a fixed CI budget without changing the accepted 30k history model.
12. **No persistent-state mutation:** representation construction leaves `TreeState` byte-for-byte unchanged.

## Budget intent

Do not begin with an arbitrary exact FPS target. First prove asymptotic behavior and measure the deterministic 30k state.

Expected qualitative relationship:

`individual primitives = entries`

`medium primitives << entries and O(structural modules)`

`far primitives < medium primitives and O(structural/axis complexity)`

After the first implementation reports real 1k/3k/10k/30k counts, set conservative regression ceilings from evidence rather than inventing numbers.

## Visual diagnostic acceptance

Before final canopy art, add neutral diagnostic modes that make grouping visible.

At minimum inspect:
- 1k individual vs medium vs far on the accepted identity matrix;
- a long-history 3k/10k/30k representation view without rendering every individual blade;
- cluster membership/keys for selected historical identities across checkpoints.

Reject the model if:
- medium/far clusters jump between unrelated branches as history grows;
- a cluster hides that it spans disconnected topology;
- far representation collapses the tree into one generic blob;
- medium representation still traces every hidden twig as a comb/band;
- cluster geometry moves substantially only because membership count changed;
- primitive counts remain effectively linear in entry count;
- zoom/detail transition would imply old identities changed where they belong.

## What does not belong here

Do not solve this checkpoint with:
- deleting old identities;
- changing historical attachments;
- weakening the 30k longevity contract;
- adding a database/cache because the deterministic model is inefficient;
- seasonal leaf loss;
- alpha-fading old history as a substitute for LOD;
- random screen-space packing;
- a raster screenshot of the tree with no identity mapping;
- final botanical styling.

## Exit condition

Canopy LOD is accepted when Vruksh can represent the same uncapped historical organism at close, medium, and far detail with exact identity coverage, append-stable cluster membership, bounded long-history primitive counts, and browser diagnostics that preserve the organism's structural identity.

Only after that should seasonal expression and final foliage art begin.
