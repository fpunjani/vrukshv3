# JE5 — Mature Score-Composition Diagnostics

Status: diagnostic checkpoint complete on top of JE4. **No growth behavior changes.**

## Why JE5 exists

JE4 established two facts simultaneously:

1. mature candidate geometry was genuinely too constrained; adding at most two bounded 3D steering proposals restored nonzero 30k attraction-field reachability while preserving runtime, scaffold reachability, XYZ safety, and LOD;
2. the mature browser crown still remained hollow, and the final-score winner was usually **not** the highest-opportunity legal candidate.

JE5 therefore measured which existing score terms were suppressing the interior-reaching candidates and whether one narrow mature architecture change was causally justified.

## Exact production score decomposition

The production score was refactored behavior-neutrally into an observable breakdown containing:

- base vigor;
- weighted spatial-clearance score (`spaceScore * 0.78`);
- crown-envelope score;
- mature 3D opportunity score;
- first-order side score;
- architecture score;
- structural recency contribution;
- deterministic jitter;
- non-opportunity subtotal;
- final total.

The diagnostic reproduces persisted historical winners and verifies that exposed terms sum back to the exact production score.

## Main finding — juvenile architecture dominates mature competition

Across six real mature structural decisions around 3k/10k/30k in ash-01..04, architecture is the dominant winner advantage over the highest-opportunity legal candidate.

By 30k the winner's average architecture advantage is approximately:

- ash-01: +2.18
- ash-02: +2.18
- ash-03: +2.68
- ash-04: +3.01

Clearance is usually a distant second; crown-envelope, recency, and jitter deltas are small.

The axis context explains the mechanism:

- highest-opportunity candidates are usually **continuations on established order-3 axes**, commonly ~10–12 modules long by 30k;
- their architecture contribution is typically strongly negative (roughly -1.75 to -2.4);
- winners are commonly short/new order-4 axes with architecture around 0 to +0.6;
- the old young-tree continuation rule keeps applying `-0.3 * excessModules` forever after preferred axis length, while short axes still receive a positive establishment bonus.

Thus mature competition systematically favors fresh/peripheral short axes over established limbs capable of steering into under-served volume.

## Why not simply increase opportunity weight

Measured break-even opportunity multipliers become very large at mature age because architecture can dominate the score budget. Median 30k break-even values ranged from roughly 6x to 44x across measured souls, with extreme events much larger. Globally multiplying opportunity would therefore risk overpowering the rest of the biological model rather than fixing the mismatched rule.

## Hypothetical 1 — remove only excess penalty

Removing only the mature negative excess-length penalty while retaining the short-axis establishment bonus was not sufficient. It changed many juvenile/early-mature comparisons but almost no 30k decisions outside ash-01.

## Hypothetical 2 — neutral mature fine-continuation architecture

JE5 then re-ranked the same historical decisions with **architecture contribution = 0 for post-1k order-3/4 continuation candidates**, removing both the short-axis establishment bonus and long-axis excess penalty from mature fine continuation competition. Every other score term remained measured/current.

Across the 48 sampled 10k+30k events, the highest-opportunity candidate would overtake the historical winner in **23/48 events (~48%)** under that one hypothetical.

Examples:

- ash-04: 100% of sampled 10k events and 67% of sampled 30k events flip;
- ash-01: 67% of sampled 30k events flip;
- ash-02: 67% at 10k and 33% at 30k;
- ash-03: 50% at 10k but 0% at 30k.

This is substantial enough to justify a real JE6 experiment, but not broad enough to assume JE6 will solve mature morphology.

## Conclusion

JE6 should change **one production rule only**:

> after the 1,000-entry horizon, architecture contribution for order-3/4 `continuation` candidates is neutral (`0`).

Keep unchanged:

- <=1k architecture behavior exactly;
- order-0/1/2 continuation architecture;
- lateral and renewal architecture;
- JE4 candidate generation;
- JE2 opportunity field/weight;
- JE1 balanced frontier;
- JE0 successor semantics;
- depth, envelopes, XYZ clearance, cadence, foliage and LOD.

JE6 must be judged on the generated organism, not the hypothetical. If it improves interior occupation without destroying hierarchy/safety, it is evidence that juvenile architecture should phase out for mature fine continuation. If it does not, revert the rule and continue the causal search rather than stacking more coefficients.
