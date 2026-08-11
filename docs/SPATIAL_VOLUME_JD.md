# Spatial Volume JD — 3D Opportunity Competition

Status: experimental follow-up to rejected JC.

## Diagnosis carried forward from JC

JC proved that persistent developmental depth works technically:

- post-1k modules used non-zero depth extensively;
- projected XY branch crossings occurred and were safely separated in XYZ;
- unsafe spatial pairs remained zero;
- depth stayed bounded and runtime remained healthy.

But the mature crown still traced a projected perimeter and left a hollow interior. The reason is not lack of Z capacity: JC's mature scoring remained dominated by XY opportunity terms, especially `crownGapScore`, which asks where a projected height band is empty rather than where developmental crown volume is under-served.

JD changes only that opportunity signal.

## Young-tree preservation

Through entry 1,000, the score path remains exactly unchanged:

- `crownGapScore` is used exactly as on the accepted V3 tree;
- restDepth remains zero;
- existing 2D collision/ordering behavior is untouched.

## Mature attraction field

After entry 1,000, `crownGapScore` is replaced by a deterministic 3D volume-opportunity score.

The field consists of a small fixed family of soul-derived attraction points in normalized mature crown volume.

Each attraction point is:

- deterministic from tree soul + point index;
- inside the crown interior rather than on the envelope wall;
- distributed through X, crown height, and Z;
- mapped into the same slowly expanding XY/Z mature volume already used by JC.

The field is not persisted. It is a deterministic environmental signal, analogous to stable available-space markers; historical branch decisions remain persisted in module topology/restDepth.

## Competition rule

For each mature candidate endpoint:

1. normalize candidate endpoint and existing terminal tips into the current mature crown volume;
2. for each attraction point, measure its distance to the nearest existing terminal tip;
3. ignore points already colonized within a small normalized kill radius;
4. measure whether the candidate endpoint would reduce that distance;
5. reward the strongest few improvements, with a bounded score.

A candidate does **not** earn opportunity merely for being far from the nearest branch. It earns opportunity by improving access to specifically under-served developmental volume.

This is intentionally closer to space-colonization logic than the previous screen-space gap heuristic.

## What does not change

JD does not change:

- depth envelope or depth magnitude;
- mature XY envelope;
- continuation/lateral/renewal angle generation;
- tropism/light targets;
- structural cadence;
- frontier recency windows;
- branch hierarchy;
- foliage, LOD, renderer, seasons, or motion.

Existing spatial clearance remains the hard legality test.

## Acceptance

JD is useful only if it changes mature *organization*, not merely scores.

Required evidence:

- <=1k tree unchanged;
- zero unsafe XYZ pairs;
- bounded depth and hierarchy;
- unchanged runtime ceiling;
- existing LOD budgets ideally return to green without loosening;
- projected mature crossings remain safely depth-separated;
- 3k/10k/30k browser morphology occupies more interior projected crown space and no longer draws the envelope as a U/ring/cap;
- no replacement failure such as isotropic spaghetti, spherical fuzz, or dense central knot.

If 3D attraction points are used heavily but the projected image remains unreadable, reject the policy rather than increasing point count or depth range blindly.