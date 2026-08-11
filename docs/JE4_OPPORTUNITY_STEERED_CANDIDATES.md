# JE4 — Opportunity-Steered Mature Continuation Candidates

Status: experimental candidate-generation checkpoint on top of JE3. Do not merge to `main`.

## Evidence from JE3

JE3 sampled 72 real mature structural decisions across ash-01..04 around 3k/10k/30k using the exact candidate/scoring path.

By 30k in every measured soul:

- roughly 28–31 attraction points remained uncolonized;
- **0%** of those attractors were improvable by any legal offered candidate;
- no candidate had positive mature-volume opportunity;
- continuation parents always had exactly one depth option;
- continuation heading span was normally only about 5–8°;
- legal candidate pools had often collapsed to single digits.

Therefore mature hollow-crown failure is now primarily a **candidate reachable-volume failure**. Score tuning cannot select an endpoint the generator never offers.

## JE4 hypothesis

Keep the existing mature candidate family intact, but give each already-eligible continuation meristem a tiny number of additional **gradual 3D steering proposals** toward currently uncolonized attraction points.

This is not target-forcing growth. A steering proposal is just another legal candidate and receives no special score bonus. The existing JE2 mature-volume opportunity signal and all other score terms decide whether it wins.

## Candidate generation

Only after entry 1,000:

1. Generate the existing three continuation candidates exactly as before.
2. Inspect the same 32 deterministic mature-volume attractors already used by JE2.
3. Ignore attractors already colonized within the existing 0.13 normalized kill radius.
4. For the current continuation parent, rank uncolonized attractors by current normalized distance from that parent endpoint and take at most the nearest **two**.
5. For each selected attractor, create one additional continuation proposal:
   - use the same continuation length as the baseline candidates;
   - compute desired XY bearing to the attraction point in world space;
   - turn gradually from the existing continuation base heading, capped at **16°**;
   - compute a target Z displacement toward the attraction point;
   - move only **45%** of the remaining Z gap in one structural step;
   - clamp Z displacement to the existing `length * 0.3` physical cap and current mature depth envelope;
   - send the proposal through the exact existing `scoreCandidate` legality, envelope, XYZ-clearance, and score path.

The original candidates remain available. JE4 adds at most two continuation candidates per already-eligible continuation parent.

### Implementation-cost invariant

The set of currently uncolonized mature attractors and normalized terminal tips is computed **once per structural event**, then reused while each eligible parent selects its nearest two targets. It must not be recomputed independently for every parent. This is semantically identical to the first JE4 implementation but avoids turning a bounded candidate experiment into avoidable repeated mature-history work.

## Gate 1 result — reachable volume PASS

The exact JE3 measurement was rerun on generated JE4 trees across ash-01..04.

At 30k, improvable-attractor fraction rose from **0 in every JE3 soul** to approximately:

- ash-01: 0.237 (meaningful >0.03: 0.143)
- ash-02: 0.123 (meaningful: 0.049)
- ash-03: 0.042 (meaningful: 0.024)
- ash-04: 0.217 (meaningful: 0.109)

Continuation parents now average roughly **2.4–2.9 distinct depth options** in the sampled 30k events instead of exactly one. The mean legal candidate pool remains bounded at roughly 10–23 candidates across those 30k samples.

This proves candidate-space reachability was a real limiting mechanism and JE4 materially restores 3D agency.

The same data also shows that the final-score winner is usually **not** the highest-opportunity candidate. That is not being tuned inside JE4; score composition remains locked until the technical and visual gates establish whether the new reachable options are useful in the actual organism.

## Locked layers

JE4 must not change:

- <=1k tree/topology/XY or zero-depth behavior;
- schema V3 / restDepth semantics;
- JE0 sympodial successor semantics;
- JE1 scaffold-balanced meristem reserve;
- JE2 mature attraction field or score coefficients;
- continuation/lateral/renewal eligibility;
- baseline continuation headings/depth delta;
- lateral/renewal candidate generation;
- branch angles, curvature, tropism, light targets;
- mature XY/Z envelopes;
- XYZ collision clearance;
- structural cadence;
- foliage, LOD, seasons, motion, or UI.

## Acceptance order

### Gate 1 — Reachability ✅
Passed as documented above.

### Gate 2 — Existing technical contracts
Without loosening limits:
- full tests/build;
- 30k longevity/runtime;
- LOD budgets;
- scaffold reachability;
- unsafe XYZ pairs = 0;
- projected crossings remain depth-separated;
- minimum non-local XYZ clearance remains safe.

### Gate 3 — Browser morphology
At 10k/30k, compared with JE1/JE2:
- crown interior / projected centre should gain meaningful structural occupancy;
- major scaffold hierarchy and soul asymmetry must remain legible;
- reject central knots, spherical fuzz, spaghetti, forced radial symmetry, or erratic zig-zag steering.

If JE4 makes the attraction field reachable but opportunity-positive candidates still consistently lose and the visual stays hollow, only then isolate score composition in a later experiment.
