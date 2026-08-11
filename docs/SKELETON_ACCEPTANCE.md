# Vruksh V3 — Skeleton Acceptance Gate

This document defines the boundary between **structural development** and **foliage/art direction**.

The skeleton is not accepted because a hero seed looks attractive. It is accepted only when the persistent developmental model, structural growth policy, derived wood geometry, automated regression matrix, and human visual review all agree that the organism is structurally credible.

## What is historical truth

`TreeState` owns developmental history only:

- soul identity;
- accepted-entry chronology;
- permanent leaf identities;
- structural module parentage;
- axis identity;
- branch order;
- birth event;
- intrinsic rest turn;
- intrinsic rest length.

World coordinates, apparent diameter, Bezier controls, wind deformation, bark, color, lighting, leaves, and other presentation state are projections. They may improve without rewriting a user's historical organism.

## Automated structural gate

A structural-engine change must preserve all of the following:

- deterministic replay;
- strict append-only historical prefixes;
- one permanent leaf identity per accepted entry;
- valid parent-before-child topology;
- one structural root;
- at most one continuation and one lateral child per module;
- continuation preserves axis and order;
- lateral growth creates a new axis and increments order;
- zero below-ground structural chord growth;
- zero strict non-local structural chord crossings;
- mature trees develop multiple terminal tips and higher branch orders;
- mature aspect ratios stay inside broad anti-pathology bounds;
- the 128-soul milestone matrix passes at 1, 3, 10, 30, 100, 300, and 1000 entries.

## Automated rendered-wood gate

The visible curved skeleton is tested separately from the structural chords.

Across the mature curve sample the projection must maintain:

- exact structural endpoints;
- finite cubic controls;
- exact tangent continuity across continuation joints;
- exact diameter continuity across continuation joints;
- lateral branches beginning thinner than the supporting axis;
- monotonic local taper from proximal to distal end;
- zero sampled below-ground curve excursions away from the root;
- zero proper non-local curved-centerline crossings;
- zero non-local curve pairs inside the current crowding threshold.

The renderer uses variable-width filled outlines derived from the cubic centerlines. Stroke width is no longer the structural representation.

## Human visual gate

Passing tests does **not** prove that the skeleton is artistically or botanically convincing.

The visual review requires:

- primary branches emerging from plausible trunk regions rather than procedural spokes;
- mature crown mass with readable hierarchy, negative space, and asymmetry;
- trunks that do not read as endless segmented poles;
- branch junctions that feel like continuous wood;
- soul variation that changes phenotype without changing quality;
- early stages that clearly become the same mature organism;
- no reliance on foliage or per-seed framing to hide weak silhouettes.

## Current checkpoint — VISUAL FAIL

On August 11, 2026 the production Vite build was rendered in headless Chrome at shared-scale milestones 30, 100, 300, and 1000 entries. The browser screenshots were inspected directly.

The automated structural and rendered-wood gates pass, but the human visual gate **fails**.

Observed failure pattern:

- around 100 entries, trees still read mainly as long central stems with a few side shoots;
- around 300 entries, lateral growth exists but seldom establishes durable scaffold limbs;
- at 1000 entries, branching is finally substantial, yet many trees remain narrow, sparse, and recognizably procedural;
- apical continuation still dominates too strongly;
- lateral axes often terminate as short decorations instead of developing persistent sub-crowns;
- maturity currently appears mostly as more marks on a pole, not as a transition into an established crown.

Therefore **foliage remains blocked**.

## Required next structural checkpoint

The next engine revision must make crown development developmental rather than decorative:

1. establish several durable scaffold axes during crown formation;
2. allow scaffold axes to retain vigor across multiple later structural events;
3. reduce indefinite trunk elongation once height is established;
4. let secondary axes develop their own continuation hierarchy;
5. direct new growth toward under-filled crown sectors while retaining asymmetry;
6. derive wood mass increasingly from supported descendant structure;
7. preserve all current history, determinism, collision, taper, and replay invariants.

The desired progression is:

**seedling → sapling → young branching tree → established scaffold crown → mature tree**

not:

**longer pole → pole with twigs → pole with more twigs**.

## Repository boundary

This clean repository carries only the V3 contracts, engine, tests, Tree Lab, minimal React/Vite bootstrap, diagnostic CSS, and CI. V1/V2 implementation history is intentionally excluded.

No foliage, atmosphere, seasons, motion, auth, database, or final product shell is allowed to mask this failed checkpoint.
