# JE5 — Mature Score-Composition Diagnostics

Status: diagnostics-only checkpoint on top of JE4. No growth behavior changes.

## Why JE5 exists

JE4 established two facts simultaneously:

1. mature candidate geometry was genuinely too constrained; adding at most two bounded 3D steering proposals restored nonzero 30k attraction-field reachability while preserving runtime, scaffold reachability, XYZ safety, and LOD;
2. the mature browser crown still remained hollow, and the final-score winner was usually **not** the highest-opportunity legal candidate.

The next question is therefore not whether to add more directions or make the attraction field stronger by guesswork. It is **which existing score terms are beating the interior-reaching candidates, and by how much**.

## No behavior change

JE5 must preserve JE4's exact candidate set, legality, scores, ordering, and persisted decisions.

The implementation refactors the existing score expression into a single internal breakdown helper while preserving the exact production arithmetic. Historical-winner fidelity is tested.

## Exact score components

For every legal candidate expose the contribution of:

- base vigor;
- weighted spatial-clearance score (`spaceScore * 0.78`);
- crown-envelope score;
- mature 3D opportunity score;
- first-order side score;
- architecture score;
- structural recency contribution (negative penalty);
- deterministic jitter;
- non-opportunity subtotal;
- final total.

## Real-event comparison

At the same real mature structural events used by JE3/JE4, compare:

1. the actual final-score winner;
2. the legal candidate with the highest 3D opportunity score.

Require the diagnostic final winner to match the persisted historical parent/relation and require the sum of the exposed components to match the candidate's actual stored score.

For events where the highest-opportunity candidate has strictly more opportunity than the winner, compute the **break-even opportunity multiplier** `w` such that:

`winner_non_opportunity + w * winner_opportunity = best_non_opportunity + w * best_opportunity`

Current JE4 uses `w = 1`.

## First measurement finding

Architecture is the dominant mature suppressor of highest-opportunity candidates. By 30k, the winner's mean architecture advantage is roughly +2.2 to +3.0 points across the four measured souls, while crown-envelope, recency, and jitter deltas are tiny and clearance is usually secondary.

The absolute context explains the pattern: winners are commonly short/new fine axes with a positive establishment bonus, while highest-opportunity candidates are usually established order-3 continuations with roughly 10–12 modules and architecture contributions around -1.75 to -2.4. The existing continuation rule keeps applying a linear `-0.3 * excessModules` penalty forever after the juvenile preferred-axis length is exceeded.

This makes a mature established limb progressively less competitive precisely because it has survived and grown long enough to reach new interior volume.

## Hypothetical causal preview

Before changing production behavior, JE5 now re-ranks only the actual winner versus the highest-opportunity candidate under one hypothetical mature rule:

- only for post-1k continuation candidates of order 3 or 4;
- keep the existing establishment bonus while the axis is shorter than its preferred juvenile length;
- once established, stop accumulating the linear excess-length penalty (architecture contribution becomes 0 rather than increasingly negative);
- every other score term remains exactly measured/current.

This hypothetical does **not** change the generated tree. It exists only to test whether the old excess-length rule is causally sufficient to explain a meaningful share of missed interior opportunities.

## Decision rule

- If removing only mature order-3/4 excess-length penalty lets the highest-opportunity candidate overtake the actual winner in a substantial share of 10k/30k sampled events, JE6 changes **that one architecture rule only**.
- If the effect is weak, do not edit architecture merely because its aggregate delta is large; continue tracing which structural context accounts for the remaining winner advantage.
- Do not globally multiply opportunity when measured break-even weights are often very large.

Candidate generation, JE1 frontier reachability, depth, envelopes, clearance, renewal, cadence, and LOD remain frozen until this measurement is interpreted.
