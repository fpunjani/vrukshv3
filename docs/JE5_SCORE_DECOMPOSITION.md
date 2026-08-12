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

## First measurement finding

Architecture is the dominant mature suppressor of highest-opportunity candidates. By 30k, the winner's mean architecture advantage is roughly +2.2 to +3.0 points across the four measured souls, while crown-envelope, recency, and jitter deltas are tiny and clearance is usually secondary.

The axis context makes the cause concrete: highest-opportunity candidates are usually established order-3 continuations with roughly 10–12 modules and architecture contributions around -1.75 to -2.4, while winners are commonly short/new order-4 axes with architecture around 0 to +0.6. The juvenile architecture rule keeps applying a linear `-0.3 * excessModules` penalty forever after the preferred axis length is exceeded.

## Hypothetical 1 — remove only mature excess penalty

JE5 first re-ranked the actual winner versus the highest-opportunity candidate while removing only the negative excess-length penalty from established order-3/4 continuations but retaining the positive short-axis establishment bonus.

This was **not sufficient** at mature scale. It reversed many 3k decisions and a few early mature decisions, but at 30k it rarely changed the winner (only ash-01 changed 1/6 sampled events; the other measured souls changed 0/6). The remaining positive establishment bonus on short/new fine continuations continued to favor peripheral fresh axes.

## Hypothetical 2 — neutral mature fine-continuation architecture

The next behavior-free re-ranking sets the architecture contribution to **0** for every post-1k order-3/4 continuation candidate, regardless of whether that axis is short or long. This removes both halves of the juvenile length-shaping rule from mature fine continuation competition:

- no positive establishment bonus for a newly short fine continuation;
- no accumulating excess-length penalty for an established fine continuation.

Renewal, lateral, order-0/1/2 architecture, opportunity, clearance, frontier, geometry, envelopes, and all other score terms remain exactly measured/current.

This is still only a hypothetical diagnostic. It does not alter the generated organism.

## Decision rule

- If neutralizing mature order-3/4 continuation architecture causes the highest-opportunity candidate to overtake the actual winner in a substantial share of 10k/30k sampled events across souls, JE6 changes **that one architecture rule only**.
- If the effect remains weak, architecture is correlated with the failure but not causally sufficient; continue tracing score/geometry instead of editing it blindly.
- Do not globally multiply opportunity when measured break-even weights are often very large.

Candidate generation, JE1 frontier reachability, depth, envelopes, clearance, renewal, cadence, and LOD remain frozen until this measurement is interpreted.
