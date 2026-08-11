# Mature Crown Envelope H — Experimental Contract

Status: lifetime morphology experiment on top of sympodial renewal G.

## Why H exists

G solved several long-life developmental problems at once: bounded hierarchy, bounded active frontier, short terminal fine axes, no very stale ordinary bud activation, healthy runtime, and one successor per mature fine tip. But it exposed a missing spatial-age rule: every successor still starts from the current outer tip, so crown extent can grow almost one segment at a time forever.

A mature organism should continue developing without treating physical crown size as proportional to accumulated entries.

H adds one mechanism only: a slowly expanding mature crown-space envelope derived from the tree's own accepted 1,000-entry structure.

## Envelope origin

The reference envelope is computed from projected structural modules born at or before entry 1,000.

It is therefore:

- specific to the tree's permanent soul and accepted young morphology;
- derived from immutable historical structure;
- not a new persisted field;
- unchanged by foliage, status, season, LOD, or later entries.

## Lifetime expansion

After entry 1,000, the reference bounds expand logarithmically with entry age.

Horizontal space grows slightly faster than vertical space so mature development is not rewarded for simply becoming taller.

Target scale:

- horizontal: `1 + 0.18 * log2(eventIndex / 1000)`;
- vertical: `1 + 0.14 * log2(eventIndex / 1000)`.

This has no hard lifetime cap. Growth can continue indefinitely, but physical extent increases progressively more slowly.

Approximate QA scales:

- 3k: 1.29x width / 1.22x height;
- 10k: 1.60x / 1.47x;
- 30k: 1.88x / 1.69x.

## Candidate rule

Through entry 1,000, candidate geometry is unchanged.

After entry 1,000, a structural candidate whose endpoint lies outside the current mature envelope is rejected before scoring. This applies equally to continuation, lateral, and renewal candidates.

H does not change:

- renewal meaning;
- branch angle or tropism;
- candidate length;
- crown-gap scoring;
- structural cadence;
- foliage or LOD;
- history/schema beyond G.

If hard spatial saturation causes boundary tracing, candidate starvation, or an unnatural rectangular/fan silhouette, H is rejected or refined on that evidence. Do not compensate by changing unrelated angles in the same experiment.

## Acceptance

H must keep all G invariants and additionally show:

1. 3k/10k/30k physical crown extent remains in a plausible continuation of the accepted 1k organism rather than expanding by an order of magnitude;
2. structural modules continue to accumulate across long-life checkpoints rather than permanently freezing immediately after maturity;
3. mature development increasingly occupies available crown space rather than producing a few envelope-reaching antennae;
4. existing runtime and LOD budgets remain unchanged;
5. no collision/taper/history regressions;
6. browser review reads as one aging tree, not a clipped box, boundary-tracing vine, flat fan, or static young tree with only more leaves.

A numeric envelope pass cannot override a worse visual organism.