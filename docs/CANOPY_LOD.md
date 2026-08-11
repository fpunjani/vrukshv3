# V3 Canopy Representation + LOD

**Status:** ACCEPTED — identity-scale representation checkpoint  
**Depends on:** accepted skeleton, foliage attachment, and Leaf Form V1  
**Scope:** deterministic detail levels, stable clustering, traceability, projected diagnostic masses, and rendering budgets across long histories

This checkpoint exists because permanent identity is uncapped while screen detail is not.

A 30,000-entry Vruksh still contains 30,000 permanent foliage identities, but medium/far views do not require 30,000 full SVG leaf blades.

LOD is therefore a **representation layer**, never a history mutation.

## Binding invariants

1. **Schema V2 does not change.** LOD level, cluster membership, cluster geometry, and render budgets are derived presentation.
2. **No identity is deleted by LOD.** Every permanent leaf identity belongs to exactly one visible representation primitive at a chosen detail level.
3. **Traceability is exact.** A cluster resolves the exact member entry IDs it represents.
4. **No re-hosting.** Clustering never changes a leaf's permanent host module, local position, or side.
5. **Old bucket assignment is append-stable.** At a fixed detail level, adding newer entries may add members to an existing bucket or create new buckets, but an older identity cannot move to a different bucket merely because later history exists.
6. **Bucket assignment does not depend on current sibling rank, current cluster population, global packing, or current screen-space nearest neighbours.**
7. **Current world geometry may evolve.** A bucket's present-day projection may move as accepted wood geometry thickens/curves with age. That is derived mechanics, not historical reassignment.
8. **Detail levels form a deterministic hierarchy.** Close detail resolves individual identities; medium and far group them using stable historical/topological keys.
9. **A coarser level simplifies geometry, not semantics.** It may show one canopy mass for many identities while retaining exact membership.
10. **Primitive count scales with structural/topological complexity rather than linearly with entry count at every zoom.**
11. **Leaf Form V1 remains the canonical close-detail form.** LOD does not redefine accepted individual leaf geometry.
12. **No seasons, motion, flowers, final texture, or final palette are part of this checkpoint.**

## Accepted detail hierarchy

### Close — `individual`

Purpose: inspection and intimate interaction.

Representation:
- one accepted Leaf Form V1 primitive per permanent identity;
- exact entry ID;
- exact historical attachment;
- accepted 2.5D phase/exposure/depth.

This representation is intentionally O(entries). It remains available as a close-detail truth, not the required whole-tree representation for very long histories.

### Medium — `module`

Purpose: normal tree-scale viewing where local foliage texture matters but every historical blade is unnecessary.

Stable bucket key:

`moduleId + stored side + stable attachment-position bin`

Accepted policy:
- 4 normalized attachment-position bins per persistent module per side.

The bin is derived only from the identity's immutable normalized attachment position. It does not use current member count.

Consequences:
- identities on the same historical wood neighbourhood can share one primitive;
- old identity -> medium bucket mapping is append-stable;
- possible primitive count is bounded by structural modules × sides × fixed bins.

### Far — `axis`

Purpose: whole-organism / long-history viewing.

Stable bucket key:

`axisId + stored side + stable module-ordinal band`

Accepted policy:
- 4 persistent modules per axis band per side.

A module's ordinal within its persistent axis is determined by historical birth order. Future continuation modules append after it, so an existing module's ordinal never changes.

Consequences:
- identities on nearby historical modules of the same axis can share one canopy mass;
- old identity -> far bucket mapping is append-stable;
- primitive count is bounded by axis/module topology rather than leaf count.

## Stable hierarchy

The accepted hierarchy is:

`entry identity -> medium module bucket -> far axis-band bucket`

Every identity can therefore resolve:
- its individual Leaf Form V1;
- its medium cluster;
- its far cluster.

Automated regression proves each medium bucket nests into exactly one far bucket.

## Cluster identity and representative geometry

Cluster IDs are derived keys, not persisted IDs.

Each cluster exposes:
- detail level;
- stable cluster key;
- exact member entry IDs;
- member count;
- stable representative entry ID;
- representative host information;
- deterministic current center/orientation/depth;
- current diagnostic length/width.

### Earliest historical representative

The accepted projection uses the bucket's earliest historical member as its representative identity.

This matters because a current arithmetic mean of all members would move whenever a future entry joins the cluster. By anchoring to the earliest member:
- later membership can alter mass/density expression;
- the representative identity itself remains append-stable;
- the cluster stays associated with a stable historical neighbourhood.

The representative is projected using accepted Leaf Form V1 against **current wood geometry**. Only representatives needed at the selected LOD are projected; medium/far rendering does not first construct every individual leaf and discard most of them.

## Diagnostic cluster geometry

Cluster geometry is intentionally neutral and is not final canopy art.

### Medium

Medium diagnostics remain relatively leaf-like so local module topology stays legible. Size increases sublinearly with member count.

### Far

The first far projection was rejected because each axis bucket looked like one oversized leaf. The result was semantically correct but visually too sparse/literal.

The accepted far diagnostic uses a broader local canopy-mass oval:
- compact long axis;
- width increasingly approaches the long axis as membership grows;
- stable representative center/orientation;
- accepted wood is rendered visibly on top.

This preserves whole-organism scaffold identity while making the representation read as a coarser canopy layer rather than a few giant leaves.

## Automated acceptance — PASS

The accepted implementation proves:

1. exact identity coverage at individual, medium, and far detail;
2. no duplicate membership;
3. exact cluster member traceability;
4. no persistent-state mutation;
5. deterministic replay;
6. append-stable medium/far bucket keys from 300 -> 1,000;
7. append-stable medium/far bucket keys from 3k -> 10k -> 30k -> 30,001;
8. medium -> far nesting;
9. close-detail equivalence with accepted Leaf Form V1 identities;
10. medium primitive count bounded by persistent module complexity;
11. far primitive count bounded more tightly by axis/module complexity;
12. stable earliest representative identities under append;
13. finite, positive cluster geometry;
14. 30k medium/far cluster geometry projected from the already-built 30k organism without a second history replay;
15. all accepted skeleton, attachment, Leaf Form V1, curved-wood, and 30k longevity gates remain green.

## Evidence-based long-history budgets

The first deterministic `longevity-soul` measurement produced:

| Entries | Structural modules | Medium buckets | Far buckets |
| ---: | ---: | ---: | ---: |
| 3,000 | 234 | 994 | 167 |
| 10,000 | 471 | 2,017 | 368 |
| 30,000 | 857 | 3,749 | 614 |

Regression ceilings were then locked with useful headroom:

| Entries | Medium ceiling | Far ceiling |
| ---: | ---: | ---: |
| 3,000 | 1,200 | 220 |
| 10,000 | 2,400 | 450 |
| 30,000 | 4,500 | 750 |

The point is not the exact current count. The invariant is that coarser whole-tree representation remains tied to persistent wood/topology rather than approaching one primitive per entry.

## Browser acceptance — PASS

### 300 / 1,000 identity matrices

Medium and far LOD were inspected across the eight accepted identity souls.

Medium:
- preserves major and secondary topology;
- remains visibly related to accepted individual foliage;
- does not move identities between unrelated branches;
- remains denser than far as intended.

Far:
- the first giant-leaf projection was rejected;
- the revised mass-like projection keeps each tree's scaffold asymmetry and crown shape recognizable;
- the tree does not collapse into one generic blob;
- accepted wood hierarchy remains visible.

### 3k / 10k / 30k long-life gate

A dedicated `?long=1` Tree Lab mode reconstructs **one organism once** and shows medium + far from the exact same `TreeState` and wood view box.

It intentionally does not construct a 30,000-blade individual render.

For `ash-01`, browser diagnostics produced:

| Entries | Medium visible primitives | Far visible primitives |
| ---: | ---: | ---: |
| 3,000 | 946 | 157 |
| 10,000 | 2,058 | 342 |
| 30,000 | 3,733 | 610 |

The counts differ slightly from `longevity-soul` because phenotype/topology differs by soul, which is expected.

Human review found:
- 3k, 10k, and 30k read as the same organism continuing to mature;
- medium remains structurally faithful even as it becomes dense;
- far remains materially lighter while retaining the major scaffold/crown identity;
- 30k far representation is still traceably the same tree rather than a generic oval cloud;
- no individual 30k leaf-blade render is needed to understand the organism;
- long-history Chrome capture completed successfully inside the normal CI job rather than requiring a special/offline rendering path.

## What this PASS does not mean

Canopy LOD is an **identity-scale representation checkpoint**, not final canopy art or a finished camera system.

It does not yet define:
- final zoom thresholds in the product UI;
- crossfade/morph animation between detail levels;
- final foliage palette;
- Shin-hanga / print texture;
- seasonal expression;
- wind;
- flowers/completion art;
- final depth compositing or lighting;
- product interaction for drilling from a cluster into a member entry.

Those concerns may consume the accepted hierarchy, but they may not rewrite its membership semantics.

## Rejected approaches

### Current-member centroid anchoring

Rejected conceptually because future members would drag an existing cluster's visual home.

### Current sibling-rank buckets

Rejected because future identities would renumber older identities.

### Screen-space nearest-neighbour packing

Rejected because camera/viewport changes could redefine historical grouping.

### One giant far leaf per bucket

Implemented as the first diagnostic and rejected visually. It preserved semantics but made far mode sparse and literal rather than canopy-like.

### Rendering all identities then hiding most

Rejected as an implementation pattern for medium/far. The accepted projection constructs geometry only for stable representatives needed at that detail level.

## What does not belong here

Do not solve future scale/rendering problems by:
- deleting old identities;
- changing historical attachments;
- weakening the 30k longevity contract;
- adding persistent LOD fields to schema V2;
- global repacking;
- seasonal leaf loss as a substitute for LOD;
- alpha-fading old history as a substitute for LOD;
- a raster screenshot with no identity mapping.

## Exit condition

**PASS.** Vruksh can represent the same uncapped historical organism at close, medium, and far detail with exact identity coverage, append-stable cluster membership, nested traceability, bounded long-history primitive counts, stable representative geometry, and browser diagnostics that preserve the organism's structural identity through 30,000 entries.

The next checkpoint may finally move into **seasonal/presentational foliage expression**, while treating skeleton, attachment, Leaf Form V1, and canopy LOD as locked lower layers.
