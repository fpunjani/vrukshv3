# Spatial Mature JC — First Depth-Enabled Growth Experiment

Status: experimental Phase C on top of green Spatial Depth J Phase B.

## What JC is allowed to change

JC is the first branch where persisted `restDepth` may become non-zero and may affect structural candidate legality/competition.

Through entry 1,000:

- all `restDepth` values remain exactly zero;
- candidate generation, 2D clearance, topology, XY geometry and visual output remain the accepted V3 young-tree model.

After entry 1,000 JC combines only mechanisms already independently justified by the mature A–I experiments:

- bounded living frontier;
- no ordinary late order-1 scaffold growth from old trunk wood;
- explicit fine same-tier `renewal` side forks at order 4;
- slowly expanding mature XY crown envelope;
- bounded developmental Z envelope;
- XYZ segment clearance rather than XY clearance.

JC deliberately does **not** retune mature light/tropism, branch angle, curvature, structural cadence, foliage, leaf form, LOD policy, season, motion, or product UI.

## Renewal relation

`renewal` is the F/I fine side-fork relation:

- born only after entry 1,000;
- parent and child order = 4;
- new axis;
- occupies the side-branch slot, mutually exclusive with a normal lateral on that parent;
- parent may also continue, so multiple local fine fronts may exist;
- max children remains 2;
- branch hierarchy remains capped at order 4.

I proved that this ramification model could not fill a strictly collision-free 2D crown without packing the envelope perimeter. JC tests whether developmental depth removes that planar bottleneck.

## Living frontier

Post-1k ordinary growth is derived from recent history:

- continuation candidate: axis must have been active within the last 64 structural births;
- lateral/renewal parent: wood must be within the last 48 structural births;
- no post-horizon lateral from trunk/order 0;
- historical wood remains permanent but exits ordinary candidate competition when dormant.

## Mature XY envelope

Reference XY bounds are derived from projected modules born <=1,000.

After entry 1,000:

- horizontal scale = `1 + 0.18 * log2(eventIndex / 1000)`;
- vertical scale = `1 + 0.14 * log2(eventIndex / 1000)`;
- endpoint cushion = 6 structural units.

A mature candidate outside this XY envelope is rejected.

## Mature Z envelope

Depth is an additional developmental volume, not an escape dimension.

Let `referenceWidth` be the accepted <=1k crown width.

After entry 1,000:

`depthHalfSpan = 2 + referenceWidth * 0.08 * log2(eventIndex / 1000)`

The allowed Z interval is symmetric around the young-tree plane:

`[-depthHalfSpan, +depthHalfSpan]`

This grows logarithmically forever. It begins near the original plane and cannot solve XY congestion by sending branches arbitrarily far toward/away from the camera.

## Depth direction

JC remains 2.5D rather than a full orientation simulator.

### Existing / continuing axes

Each axis has a stable deterministic mature depth tendency derived from the permanent tree soul and axis ID.

For post-1k continuations:

- most recent segment depth direction is inherited;
- a smaller component pulls toward the stable axis tendency;
- bounded deterministic local variation prevents perfectly planar depth rails;
- per-module `|restDepth|` is capped relative to XY segment length.

### New lateral / renewal axes

A new side axis receives a deterministic signed depth departure derived from soul, event, parent and relation.

The magnitude is modest relative to XY segment length; it does not replace XY branching divergence.

Every accepted depth delta is persisted in `restDepth`.

## Candidate clearance

Entry <=1,000:

- use the existing 2D segment clearance function exactly.

Entry >1,000:

- candidate start/end are evaluated in XYZ;
- compare against persisted spatial segments using minimum 3D segment distance;
- retain the same direct-parent/sibling local-junction exclusions as the accepted 2D solver;
- the structural minimum-clearance threshold is unchanged.

A screen-space crossing is therefore legal only when the developmental branches are sufficiently separated in Z.

## Screen crossing vs collision

JC must not rewrite `projectTree()` into a 3D renderer.

- XY projection remains the public composition geometry;
- projected non-local crossings may appear after 1k;
- unsafe XYZ collisions remain forbidden.

Diagnostics must report these separately before JC can be accepted.

## First-pass depth formula constraints

The initial implementation should prefer simple bounded deterministic mechanics over coefficient search:

- new side-axis depth departure: about 12–24% of XY module length, deterministic sign;
- continuation depth direction: inherited recent delta plus weaker axis tendency/local drift;
- maximum per-segment depth displacement: 30% of XY module length;
- depth envelope remains the final hard constraint.

If this is insufficient, diagnose the failure. Do not immediately add more random depth candidates or large depth ranges.

## Acceptance gates

JC is not accepted until all of these agree:

1. <=1k restDepth exactly zero and accepted XY structure unchanged;
2. schema/history/replay deterministic;
3. renewal legal only as mature order-4 same-tier/new-axis side fork;
4. max children <=2 and max order <=4;
5. existing 30k runtime remains <=60s;
6. existing LOD budgets remain unchanged for the first pass;
7. mature Z extent remains inside the defined logarithmic envelope;
8. zero unsafe XYZ straight-segment collisions;
9. zero unsafe XYZ curved-wood collisions once curved diagnostics are upgraded;
10. mature projected crossings, if present, are depth-separated rather than structural errors;
11. 3k/10k/30k browser morphology no longer perimeter-traces or leaves the I-style hollow crown;
12. depth does not create unreadable projected spaghetti;
13. multi-soul results agree with the visual conclusion.

## Visual proof order

Do not start with pretty depth shading.

1. naked XY skeleton;
2. neutral depth-debug skeleton (depth ordering / labels or neutral depth cue);
3. spatial crossing diagnostic;
4. existing medium/far foliage projection only after the wood is structurally credible.

If JC succeeds structurally but the current LOD grouping misinterprets depth-separated renewal axes, fix LOD only as a separately justified representation checkpoint.

If JC fails by creating spatial spaghetti rather than volume, reject JC rather than enlarging Z or adding decorative occlusion tricks.