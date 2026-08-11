# Spatial Depth J — 2.5D Developmental Architecture

Status: experimental architecture checkpoint. Infrastructure first; no mature-growth acceptance until all spatial invariants are proven.

## Why J exists

The strictly planar mature-growth line A–I has been exhausted deliberately.

The strongest final 2D experiment, I, satisfied runtime, history, hierarchy, LOD and mature-size metrics while still producing an unmistakably procedural crown: fine growth packed along the legal 2D perimeter and left a hollow interior. The remaining limiting hypothesis is therefore not another angle/dormancy/envelope coefficient. It is the assumption that all wood must occupy one collision-free plane.

Real crown development competes for three-dimensional space. Vruksh still renders a two-dimensional image, but the image should be a projection of developmental space rather than the space in which all collision decisions are forced to occur.

J tests that distinction.

## 1. Developmental depth is history

If depth influences whether a branch may grow, depth cannot be a renderer-only random value.

A future accepted spatial schema will add one immutable field to each structural module:

`restDepth: number`

Meaning:

- signed displacement along the developmental Z axis from the parent endpoint to this module endpoint;
- root starts at Z = 0;
- a module's endpoint depth is `parent.endDepth + restDepth`;
- `restTurn` and `restLength` continue to define the accepted XY developmental projection;
- `restDepth` does not alter historical parentage, entry identity, or branch order.

The field is stored because it participates in structural collision/space competition. Recomputing it under later code could rewrite which historical candidates would have been legal.

## 2. Young-tree preservation

Every structural module born at or before entry 1,000 must have:

`restDepth = 0`

Therefore:

- the accepted 30 / 100 / 300 / 1,000 topology is unchanged;
- all <=1k XY geometry remains byte-for-byte equivalent apart from the additive schema field/tag;
- all young wood occupies the original developmental plane;
- 2.5D is a mature-space capability, not a way to re-roll the accepted young tree.

## 3. Spatial projection

J distinguishes two projections.

### Screen / art projection

Existing `projectTree()` remains XY and continues to drive the familiar Vruksh composition.

Projected branches may cross in XY after maturity. A screen crossing is no longer automatically a structural collision.

### Developmental projection

`projectTreeSpatial()` derives XYZ endpoints from the persisted module history.

Structural clearance is evaluated in XYZ developmental space. Two branches whose screen projections cross are legal only if their true spatial distance satisfies the same minimum-clearance intent as the accepted planar model.

Local parent/child and sibling junction exceptions remain local geometry; depth must not accidentally invalidate a legitimate fork.

## 4. Crossing semantics

After spatial depth is active, diagnostics must stop conflating these two facts:

- **projected crossing**: two XY projections intersect;
- **spatial collision**: two developmental segments are physically too close in XYZ.

Projected crossings may be desirable evidence that mature crown volume is being used.

Spatial collisions remain a hard failure.

The accepted <=1k tree should still have zero projected non-local crossings because all young depth is zero and the young solver is unchanged.

## 5. Depth is bounded crown volume, not an escape dimension

Z cannot become the next unbounded workaround.

When mature growth begins, allowable depth emerges gradually from zero and remains tied to the accepted 1k organism's crown scale. The first morphology prototype should use a deterministic symmetric depth envelope derived from mature reference width and age.

Depth capacity may expand slowly with lifetime age, but ordinary growth cannot solve every XY conflict by fleeing arbitrarily far toward the camera or background.

## 6. First mature morphology hypothesis

Only after the spatial infrastructure is green should J test mature morphology.

The leading hypothesis combines the mechanisms already justified by A–I:

- bounded living frontier;
- no ordinary late trunk/order-1 scaffold creation;
- explicit mature fine same-tier renewal at order 4;
- slowly expanding mature XY crown envelope;
- persistent developmental depth for post-1k growth;
- XYZ clearance rather than XY clearance.

The first depth-enabled renewal should use the side-ramification interpretation, because I showed that multiple local fine fronts are needed to occupy crown volume while the planar collision constraint prevented those fronts from filling the interior naturally.

No mature light/tropism retuning belongs in the first spatial test.

## 7. Depth mechanics — initial constraints

The first prototype should remain 2.5D, not become an unconstrained full-3D plant simulator.

- continuations inherit most of their axis's recent depth direction;
- new lateral/renewal axes receive a deterministic modest signed depth departure;
- depth change per module is bounded relative to module length;
- a slowly expanding Z envelope limits cumulative depth;
- no perspective scaling is needed for the developmental proof;
- screen draw order may use segment/host depth for diagnostic occlusion only after the spatial history is validated.

## 8. Schema honesty

`main` is currently schema V2.

If J's mature model is eventually accepted, schema V3 may include both:

- `GrowthRelation = ... | "renewal"`;
- `GrowthModule.restDepth`.

These belong in one pre-production schema transition because neither experimental vocabulary has ever been merged to production/main.

The separate persistence/model-version contract still governs future real-user migration. An accepted J does not authorize replaying future stored trees under arbitrary new algorithms.

## 9. Phase gates

### Phase A — spatial mathematics / projection

Before changing growth:

- add tested 3D point/segment clearance primitives;
- add an XYZ structural projection for synthetic histories;
- prove symmetry/finite behavior/degenerate cases;
- prove an XY crossing separated in Z has non-zero spatial clearance;
- prove same-depth XY crossing remains a collision;
- do not change existing tree output.

### Phase B — persisted depth history

- add schema-V3 experimental `restDepth`;
- existing <=1k modules get exactly zero;
- diagnostics validate finite/bounded rest depth;
- replay and live append remain deterministic;
- all accepted <=1k XY module geometry remains unchanged.

### Phase C — mature spatial growth

- use XYZ clearance for post-1k candidates;
- introduce bounded deterministic depth motion and mature fine renewal;
- keep the same runtime/LOD budgets unless a representation-layer change is independently justified;
- inspect 3k / 10k / 30k across multiple souls.

### Phase D — visual depth proof

Only after C is structurally healthy:

- add a neutral depth-debug view;
- render farther wood behind nearer wood deterministically;
- show that accepted projected crossings correspond to safe spatial separation;
- do not use color/opacity tricks to hide bad morphology.

## 10. Acceptance criteria

A spatial model is not accepted merely because it allows more branches.

It must show:

1. exact accepted <=1k topology and XY morphology preservation;
2. deterministic persisted depth history;
3. zero unsafe XYZ collisions;
4. projected mature crossings that are demonstrably depth-separated rather than accidental overlap;
5. bounded depth extent;
6. no runaway branch hierarchy or candidate-search explosion;
7. no mature perimeter tracing / hollow crown like I;
8. no flat hedge, tangled scribble, or arbitrary spaghetti enabled by depth;
9. unchanged identity/attachment semantics;
10. human visual evidence that 3k -> 10k -> 30k reads as the same organism filling crown volume.

## 11. Stop conditions

If 2.5D merely converts the old boundary artifacts into unreadable overlapping spaghetti, reject the morphology policy rather than celebrating projected crossings.

If depth must be made extremely large to avoid collisions, reject the model.

If accepted <=1k XY geometry changes, reject the implementation.

If renderer-only depth is sufficient only by contradicting structural collision history, reject it.

The goal is not "more 3D." The goal is a truthful persistent organism whose mature image can contain the overlapping visual hierarchy that a single collision-free plane prevented.