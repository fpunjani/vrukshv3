# JE5 — Mature Score-Composition Diagnostics

Status: diagnostics-only checkpoint on top of JE4. No growth behavior changes.

## Why JE5 exists

JE4 established two facts simultaneously:

1. mature candidate geometry was genuinely too constrained; adding at most two bounded 3D steering proposals restored nonzero 30k attraction-field reachability while preserving runtime, scaffold reachability, XYZ safety, and LOD;
2. the mature browser crown still remained hollow, and the final-score winner was usually **not** the highest-opportunity legal candidate.

The next question is therefore not whether to add more directions or make the attraction field stronger by guesswork. It is **which existing score terms are beating the interior-reaching candidates, and by how much**.

## No behavior change

JE5 must preserve JE4's exact candidate set, legality, scores, ordering, and persisted decisions.

The implementation may refactor the existing score expression into a single internal breakdown helper only if the final total uses the same arithmetic terms and all historical-winner regression tests stay green.

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

## Measurements

Across sampled 3k/10k/30k events report:

- fraction where final winner is already highest-opportunity;
- winner opportunity rank;
- winner capture of best opportunity;
- mean/median break-even multiplier;
- fraction of events whose break-even is <=1.25 / 1.5 / 2 / 3;
- mean winner-minus-best-opportunity delta for every non-opportunity score component;
- relation mix of the highest-opportunity candidates;
- winner versus best-opportunity axis module counts / branch order, so a large architecture delta can be traced back to establishment/excess-length mechanics rather than inferred from the score alone.

## Decision rule

- If one specific non-opportunity term consistently supplies most of the winner's advantage, the next experiment changes **that term only** in mature scoring.
- If several terms are individually small but the best-opportunity candidate usually needs only a modest global multiplier, the next experiment changes the **mature opportunity weight only**.
- If break-even weights are very large, do not simply overpower the rest of the growth model; inspect why the opportunity candidate is structurally implausible despite being closer to the attraction field.

Candidate generation, JE1 frontier reachability, depth, envelopes, clearance, renewal, cadence, and LOD remain frozen until this measurement is interpreted.
