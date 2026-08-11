# JE4 — Opportunity-Steered Mature Continuation Candidates

Status: experimental candidate-generation checkpoint on top of JE3. **Reachability/safety PASS; mature morphology FAIL. Do not merge to `main`.**

## Evidence from JE3

JE3 sampled 72 real mature structural decisions across ash-01..04 around 3k/10k/30k using the exact candidate/scoring path.

By 30k in every measured soul:

- roughly 28–31 attraction points remained uncolonized;
- **0%** of those attractors were improvable by any legal offered candidate;
- no candidate had positive mature-volume opportunity;
- continuation parents always had exactly one depth option;
- continuation heading span was normally only about 5–8°;
- legal candidate pools had often collapsed to single digits.

Therefore mature hollow-crown failure had become primarily a **candidate reachable-volume failure**. Score tuning could not select an endpoint the generator never offered.

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

The set of currently uncolonized mature attractors and normalized terminal tips is computed **once per structural event**, then reused while each eligible parent selects its nearest two targets. It must not be recomputed independently for every parent.

Mature-frontier derivation is also skipped entirely during the accepted <=1k phase. Mature machinery must have zero cost before the horizon if it cannot affect a young-tree decision.

Experimental regression tests were tightened so narrow semantic tests no longer duplicate four-soul 3k/30k replay sweeps already covered by dedicated measurement gates. The production-quality 128-soul <=1k and 30k longevity limits were **not** raised.

## Gate 1 — reachable volume PASS

The exact JE3 measurement was rerun on generated JE4 trees across ash-01..04.

At 30k, improvable-attractor fraction rose from **0 in every JE3 soul** to approximately:

- ash-01: 0.237 (meaningful >0.03: 0.143)
- ash-02: 0.123 (meaningful: 0.049)
- ash-03: 0.042 (meaningful: 0.024)
- ash-04: 0.217 (meaningful: 0.109)

Continuation parents now average roughly **2.4–2.9 distinct depth options** in sampled 30k events instead of exactly one. Mean legal candidate count remains bounded at roughly 10–23 across those samples.

This proves candidate-space reachability was a real limiting mechanism and JE4 materially restores 3D agency.

A second signal is equally important: the final-score winner is usually **not** the highest-opportunity candidate. That is deliberately not tuned inside JE4.

## Gate 2 — technical / spatial safety PASS

The generated JE4 organism passed the dedicated four-soul 3k/10k/30k frontier + spatial audit:

- all accepted first-order scaffold lineages remain represented at every checkpoint;
- selected mature continuation frontier stays only about 16–20 tips;
- `matureDepthFraction = 1` throughout measured post-1k wood;
- every projected crossing remains depth-separated;
- `unsafeSpatialPairs = 0` everywhere;
- minimum non-local XYZ clearance stays above approximately 2.0;
- 30k far LOD remains comfortably inside the existing budget (about 571–574 in the measured souls).

The final clean branch also passed the unchanged normal test suite and production build after removing mature-only work from the <=1k path and removing redundant experimental test replay cost. No timeout or LOD ceiling was loosened.

## Gate 3 — browser morphology FAIL

The exact final browser artifact shows that restored candidate reachability **does not yet produce a believable mature crown**.

At 3k the organism remains plausible. By 10k the upper wood increasingly organizes into a broad perimeter/roof around a large interior void. By 30k, the steering proposals produce a stronger top/perimeter network but the dominant projected negative space is still a very large hollow U/M-shaped cavity.

Compared with JE1/JE2, JE4 changes upper routing and gives the solver legal 3D agency, but it does not materially convert that agency into persistent interior crown occupation. It is therefore not a mature morphology acceptance candidate.

This is useful failure, not a reason to remove JE4's reachability work: JE4 established that useful 3D candidates can exist safely and cheaply.

## Locked layers

JE4 did not change:

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

## Conclusion / next causal question

Do **not** widen angles again and do **not** add more attractors.

JE3 showed that before steering there were no good candidates. JE4 now shows that good candidates exist, but the final-score winner usually does not capture the best available 3D opportunity and the browser crown remains hollow.

The next checkpoint must inspect **score composition**, not guess at a multiplier. Measure the actual score components for the final winner versus the highest-opportunity legal candidate at real mature events:

- base vigor;
- space / XYZ clearance contribution;
- crown-envelope contribution;
- 3D opportunity contribution;
- first-order side term;
- architecture term;
- recency term;
- deterministic jitter;
- total final score.

Also compute the smallest hypothetical opportunity weight at which the best-opportunity candidate would overtake the actual winner. This tells us whether opportunity is being suppressed by one specific architectural term or is simply too small relative to the whole score budget.

Only after that measurement should a JE5 scoring experiment change exactly one composition rule. Candidate generation, frontier, geometry, envelopes, and opportunity field should remain frozen.
