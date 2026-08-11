# Mature Ramification I — Final 2D Experiment

Status: experimental. This is the last planned strictly planar/non-crossing mature-growth model before considering 2.5D wood.

## Hypothesis

The A–H experiments isolated three long-life needs:

1. a bounded living frontier so historical wood is not an ever-growing candidate pool;
2. fine same-tier renewal so order-4 wood is not forced into indefinite terminal continuation;
3. mature crown-space saturation so renewed shoots do not expand the physical crown one segment at a time forever.

F supplied (1)+(2) but had unlimited space, so fine shoot systems proliferated outward into long procedural ribbons.
H supplied (1)+(3) with a single sympodial successor path, so mature development traced the crown envelope instead of ramifying through it.

I combines F-style local fine **side ramification** with H-style mature crown-space saturation.

## Renewal semantics in I

`renewal` is the F relation:

- mature-only, born after entry 1,000;
- parent and child remain in fine order 4;
- creates a new axis;
- occupies the side-branch slot, mutually exclusive with a normal lateral on that parent;
- parent may also have a continuation, so fine-tip count can increase locally;
- max structural children remains 2;
- hierarchy remains bounded at order 4.

The bounded frontier prevents every historical order-4 module from remaining a renewal site forever.

## Mature crown envelope

The reference envelope is derived from projected modules born at or before entry 1,000.

After entry 1,000:

- horizontal scale = `1 + 0.18 * log2(eventIndex / 1000)`;
- vertical scale = `1 + 0.14 * log2(eventIndex / 1000)`;
- a 6-unit fine-twig cushion avoids an immediate post-horizon discontinuity.

Candidates outside the current envelope are rejected before scoring. The envelope has no lifetime cap; it simply expands logarithmically.

## What I is testing

The question is not whether more fine branches look lush. The question is whether **bounded local ramification can occupy crown gaps naturally in a strictly planar collision-free organism**.

A pass should show:

- multiple local fine growth fronts rather than one boundary-following successor path;
- increasing internal crown occupancy from 3k -> 10k -> 30k;
- no runaway physical extent;
- no obvious envelope tracing;
- no dense rectangular hedge / comb / fan pattern;
- no severe structural starvation;
- unchanged runtime and LOD budgets.

## Hard acceptance rules

- <=1k historical structure remains unchanged apart from experimental schema tag;
- max order remains 4;
- renewal remains order-4 same-tier/new-axis/mature-only;
- max children <=2;
- old side-growth and long dormant-axis tails remain bounded by the frontier;
- 30k stays inside the existing 60-second longevity budget;
- LOD ceilings are not loosened to make I pass;
- collisions/taper/history remain clean;
- human browser review at 3k/10k/30k overrides attractive metrics.

## Escalation rule

If I still produces boundary tracing, planar packing artifacts, severe candidate starvation, or a visibly procedural crown, stop tuning 2D coefficients.

At that point the evidence supports a new architectural question: persistent 2.5D branch depth/orientation so branches may overlap in screen projection while remaining separated in developmental space. Do not respond to an I failure by stacking more unrelated 2D scoring weights.