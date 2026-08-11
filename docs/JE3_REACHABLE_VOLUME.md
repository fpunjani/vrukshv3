# JE3 — Mature Candidate Reachable-Volume Diagnostics

Status: measurement-only diagnostic branch on top of rejected JE2. No growth behavior changes.

## Why this checkpoint exists

By JE2 we have separately proven:

- persisted 2.5D depth is used and spatially safe;
- accepted scaffold lineages can remain developmentally reachable with a small bounded frontier;
- a deterministic 3D attraction/opportunity field can participate in mature scoring;
- runtime and LOD remain bounded.

Yet the 10k/30k crown still forms a hollow projected perimeter.

The remaining ambiguity is **candidate reachability versus score composition**.

A score can only choose among endpoints the candidate generator offers. Current mature continuation generation provides three closely spaced XY headings around the current branch direction, all sharing a single deterministic depth delta. Laterals and renewals provide two side headings whose depth deltas are also generated independently of the attraction field.

JE3 measures whether that candidate set can actually reach under-served crown volume.

## No behavior change

JE3 must not change:

- candidate eligibility;
- candidate headings, lengths, or depth deltas;
- scores or coefficients;
- JE0 successor semantics;
- JE1 scaffold reserve;
- JE2 attraction field;
- envelopes, clearance, cadence, foliage, LOD, renderer, or UI.

The diagnostic must call the same private candidate generators/scoring path used by `growStructuralEvent`; it must not recreate an approximate second generator in the test.

## Measurements at sampled real mature structural events

For each sampled historical structural birth event, reconstruct the exact prefix immediately before that event and inspect the legal candidate set.

Measure:

1. **Candidate-set size**
   - legal candidates;
   - distinct parent meristems;
   - relation counts.

2. **Directional freedom**
   - continuation heading span per parent;
   - unique continuation depth deltas per parent;
   - fraction of candidates moving toward projected crown centre (|normalized X| decreases);
   - fraction moving toward 3D radial centre (sqrt(X²+Z²) decreases).

3. **Attractor reachability**
   - current uncolonized attractors;
   - fraction for which at least one legal candidate improves nearest-tip distance;
   - fraction with meaningful improvement (>0.03 normalized units);
   - mean and maximum best possible improvement.

4. **Scoring agency**
   - opportunity score of the actual final-score winner;
   - highest available opportunity score;
   - opportunity rank of the final winner;
   - fraction of sampled events where the final winner is also the best-opportunity candidate.

5. **Historical sanity**
   - diagnostic winner must match the actual persisted module's parent/relation at sampled events.

## Decision rule

If many under-served attractors have no improving legal candidate, or continuation depth/heading diversity is effectively one-dimensional, the next experiment belongs to **candidate generation**.

If attractor reachability is high but high-opportunity candidates consistently lose to other score terms, the next experiment belongs to **score composition**.

Do not change both in the same experiment.
