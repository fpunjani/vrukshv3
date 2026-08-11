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

### Gate 1 — Reachability
Re-run JE3 exact-candidate diagnostics on the generated JE4 tree.

Required direction of travel:
- 30k improvable-attractor fraction materially above zero across souls;
- continuation parents gain >1 depth option for a meaningful fraction of sampled events;
- legal candidate pool remains bounded in the tens, not historical-size growth.

If this fails, reject JE4 before visual tuning.

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
