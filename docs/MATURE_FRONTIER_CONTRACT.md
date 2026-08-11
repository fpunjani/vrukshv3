# Mature Frontier Contract

Status: experimental contract for post-1,000 structural development.

## Why this exists

The accepted V3 tree is structurally credible through the 1,000-entry visual-development horizon, but long-life diagnostics exposed two coupled lifetime pressures:

1. old latent buds and dormant axes can remain eligible for ordinary growth for too long;
2. the hard terminal branch-order cap forces fine axes to elongate because the terminal class cannot renew laterally.

Experiments A–C showed that suppressing dormancy or retuning tropism in isolation can improve a metric while making the organism worse. Experiment D showed that allowing terminal branching helps local mature structure, but globally unbounded eligibility makes branch depth and candidate-search cost grow too freely.

The next model therefore separates **historical existence** from **current developmental eligibility**.

## Binding invariants

These remain unchanged:

- Tree N+1 is the same organism as Tree N plus new growth.
- No historical module is deleted, re-parented, re-ordered, or re-hosted.
- Every accepted entry keeps its permanent foliage identity and historical attachment.
- All structural decisions through entry 1,000 must remain exactly unchanged.
- A continuation preserves its axis and true topological order.
- A lateral creates a new axis and increments true topological order by exactly one.
- Seasons, status, inactivity, LOD, and renderer choices cannot change topology.

## Mature developmental model

After entry 1,000, ordinary structural growth is restricted to a derived **living frontier**.

### Continuation frontier

An axis tip may compete for continuation only while that axis has been structurally active within a bounded recent window.

Historical axis tips outside that window remain part of the organism but are dormant for ordinary growth. A future explicit disturbance/pruning/rejuvenation feature may define a separate reactivation rule; ordinary entry accumulation must not silently wake arbitrarily old axes.

### Lateral frontier

A mature lateral may arise only on sufficiently recent wood near the living frontier.

- Ancient interior wood does not remain an ordinary latent-bud candidate forever.
- Post-horizon creation of a brand-new order-1 scaffold from the trunk is not ordinary mature growth.
- Recent established scaffold/fine wood may still branch so the crown can renew rather than only elongate.

### Topological order vs mechanical class

True topological order is historical information and may continue beyond 4 when fine twigs renew.

Mechanical behavior is bounded: orders at or above the fine-twig threshold use the same fine structural class for length, vigor/tropism family, foliage preference, and thickness family. Increasing topological depth must not create ever-thinner or ever-more-exotic visual species.

This avoids inventing a new persisted `renewal` relation unless the simpler truthful topology proves insufficient.

## Complexity requirement

Historical wood may grow without becoming the candidate pool.

Post-horizon candidate generation must be bounded by the living frontier rather than by all historical modules. A 30,000-entry organism must remain inside the existing longevity performance budget; do not raise the timeout to make a frontier policy pass.

## Acceptance gates

A mature-frontier candidate is acceptable only if all of these hold:

1. **Young-tree identity** — 30 / 100 / 300 / 1,000 accepted structure remains unchanged.
2. **Historical integrity** — append-only module/leaf prefixes and attachment identities remain unchanged.
3. **Performance** — the existing 30k longevity test remains within its current budget.
4. **Dormancy** — >100-structural-birth ordinary lateral activation and long continuation resumption are strongly reduced without starving the crown.
5. **Renewal** — terminal fine axes no longer absorb mature growth mainly by indefinite continuation.
6. **Mechanical boundedness** — higher true topological order does not alter the finite fine-twig mechanical family.
7. **Morphology** — 3k / 10k / 30k browser gates read as one aging, continuously branched organism rather than poles, bouquets, a flat fan, or a sparse collection of towers.
8. **No metric-only acceptance** — a diagnostic improvement cannot override a worse human visual read.

## Explicit non-goals

This checkpoint does not add:

- a persisted bud object;
- a new `renewal` relation;
- pruning/disturbance reactivation;
- branch depth / 2.5D wood;
- seasons, rhythm, motion, or final art;
- backend persistence or product UI.

If a bounded derived frontier still cannot produce a convincing lifetime crown, the next architectural question is whether strict planar/non-crossing wood is itself the limiting assumption. Do not respond by stacking more unrelated scoring coefficients.