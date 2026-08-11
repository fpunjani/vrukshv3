# Vruksh V3 — Skeleton Acceptance Gate

This document defines the accepted boundary between **structural development** and downstream foliage/art direction.

A skeleton is not accepted because one hero seed looks attractive. It is accepted only when persistent developmental history, structural growth, derived wood geometry, automated regression, and human visual review agree that the organism is structurally credible.

## Historical truth

Structural history owns:

- soul identity;
- accepted-entry chronology;
- structural module parentage;
- axis identity;
- branch order;
- birth event;
- intrinsic rest turn;
- intrinsic rest length.

World coordinates, apparent diameter, Bézier controls, wind deformation, bark, color, lighting, foliage geometry, and other presentation state are projections.

Foliage attachment is a later schema-V2 historical layer and does not alter the accepted wood topology.

## Automated structural gate

Structural changes must preserve:

- deterministic replay;
- strict append-only historical prefixes;
- valid parent-before-child topology;
- one structural root;
- at most one continuation and one lateral child per module;
- continuation preserves axis and order;
- lateral growth creates a new axis and increments order;
- zero below-ground structural chord growth;
- zero non-local structural chord crossings;
- true segment-to-segment non-local clearance with only legitimate local fork exceptions;
- mature multiple terminal tips and higher branch orders;
- broad anti-pathology aspect bounds;
- durable first-order scaffold establishment;
- sublinear structural growth;
- the 128-soul milestone matrix at 1, 3, 10, 30, 100, 300, and 1000 entries.

## Automated rendered-wood gate

The visible curved skeleton is tested separately from structural chords. It must maintain:

- exact structural endpoints;
- finite cubic controls;
- tangent continuity across continuation joints;
- diameter continuity across continuation joints;
- lateral branches beginning thinner than the supporting axis;
- monotonic proximal-to-distal taper;
- zero sampled below-ground curve excursions away from the root;
- zero proper non-local curved-centerline crossings;
- zero pathological non-local crowding under the current broad threshold.

The renderer uses variable-width filled outlines derived from cubic centerlines rather than treating SVG stroke width as structure.

## Developmental crown rules that earned acceptance

The accepted scaffold/crown revision corrected the earlier pole-with-twigs failure by introducing:

- first-order scaffold establishment before secondary branching;
- enough scaffold continuation vigor for limbs to persist;
- declining trunk/leader preference once crown formation begins;
- branch-density and crown-gap signals that encourage occupied space without predrawing a crown;
- first-order mature light-seeking only after scaffold establishment;
- branch-order-specific lateral divergence;
- stable axis-specific mechanics rather than random per-segment wobble;
- derived taper that reflects supported distal structure;
- cached per-growth-event context so stronger QA remains affordable.

## Human visual gate

The accepted browser review at 30 / 100 / 300 / 1000 entries requires:

- saplings that visibly become established trees rather than longer poles;
- persistent scaffold limbs by the young-tree stages;
- mature crown mass with hierarchy, negative space, and asymmetry;
- trunks that stop visually dominating once crown formation begins;
- branch axes that bend coherently rather than radiating as identical straight rays;
- progressively smaller branching divergence at higher orders rather than repeated same-angle Y fractals;
- soul variation that changes phenotype without changing quality;
- early stages that remain recognizably the same mature organism;
- no reliance on foliage or per-seed framing to hide weak silhouettes.

## Current checkpoint — PLAIN SKELETON ACCEPTED

On August 11, 2026 the scaffold/crown revision replaced the earlier visual failure and was accepted as the plain-wood baseline.

This does **not** mean final tree art is complete. It means downstream work may build on the wood without being allowed to rewrite or conceal it.

The skeleton gate remains a permanent regression contract. Foliage, seasons, motion, or product UI must not weaken it.

## Repository boundary

This clean repository carries only the V3 contracts, domain engine, tests, Tree Lab, minimal React/Vite bootstrap, diagnostic styling, and CI. V1/V2 implementation history is intentionally excluded.

The next independent checkpoint is foliage identity and historical attachment. Final leaf art remains downstream of that checkpoint.
