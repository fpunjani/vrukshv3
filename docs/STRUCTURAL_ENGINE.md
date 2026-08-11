# Vruksh V3 Structural Engine

Status: **implementation plan for the first credible skeleton engine**

This document defines the structural engine before foliage, texture, motion, or product UI are allowed back into the project.

## Chosen model

V3 uses a **developmental, self-organizing 2D tree model**.

The persistent object is the developmental graph (`GrowthModule` + axes). For each structural event, the engine derives possible buds from that graph, evaluates them against internal tree tendencies and available space, and commits one new module.

The model is inspired by developmental procedural-botany ideas: competition between buds/branches for space, apical dominance and branch-order signals, local response to crowding, and deterministic phenotype-level variation. It is not a full scientific simulator, generic L-system interpreter, or fixed mature crown revealed over time.

## Persistent data vs transient simulation

Persist:

- soul;
- growth-event chronology;
- axes and parent-child topology;
- continuation/lateral relation;
- branch order;
- intrinsic rest turn and rest length;
- permanent entry identities.

Derive each event:

- world-space geometry;
- active apical buds;
- available lateral buds;
- local clearance;
- crossing/crowding penalties;
- current crown bounds;
- candidate vigor/score;
- apparent thickness.

Do not persist candidate scores, collision grids, SVG points, or render caches.

## Stable soul traits

The initial trait set is intentionally small and meaningful:

1. `lean` — preferred trunk/crown directional bias;
2. `apicalDominance` — relative preference for continuing lower-order axes;
3. `branchAngle` — characteristic lateral divergence;
4. `curvature` — amplitude of local continuation bends;
5. `crownAspect` — soft target for width relative to height.

Traits alter shape, not the amount of growth earned by the user. Structural-event frequency remains independent of soul.

## Bud model

Every axis with no continuation child has an apical continuation bud. A module may offer a lateral bud when it has no lateral child, is old enough, and remains below maximum branch order.

A growth module may have at most one continuation child and one lateral child in the 2D model.

## Space and collision

Hard failures include non-finite geometry, below-ground growth, strict intersection with unrelated structure, and effectively zero-length growth.

Soft penalties include endpoint crowding, near-parallel crowding, excessive local density, and pushing far outside the soul-specific crown envelope.

## Current failure discovered by visual QA

The collision-safe candidate model solved the earlier branch-soup problem but over-corrected toward apical dominance. A lateral bud can win, yet the resulting axis often fails to become a long-lived scaffold. The mature visual result is therefore too tall and twig-like.

The next revision must model **axis persistence and crown establishment**, not merely candidate creation.

A scaffold axis should have a developmental window in which its apical continuation receives enough resource to establish a meaningful limb. Conversely, the main leader should lose elongation priority as the tree reaches crown-forming maturity. Under-filled crown sectors should create opportunity without predrawing a target tree.

This must remain deterministic and append-only: the engine changes which new module wins; it does not rewrite old modules.

## Taper

Thickness remains derived, not historical. It should increasingly reflect supported distal structure so a successful scaffold becomes visibly stronger as its descendant system grows.

## Validation gates

Automated sweep remains mandatory across at least 128 deterministic souls and milestones 10, 30, 100, 300, and 1000. Existing topology, crossing, ground, taper, tangent, and append-only checks may not be weakened to make the new engine pass.

Visual acceptance additionally requires readable crown hierarchy by 100–300 entries and convincing mature scaffold systems by 1000 entries.

## What we will not do yet

Until this skeleton passes:

- no leaves;
- no flowers;
- no bark texture;
- no grain;
- no atmosphere;
- no wind;
- no seasons;
- no homepage integration;
- no rendering-library migration.

If the plain skeleton is wrong, the structural engine is wrong.
