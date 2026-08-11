# JE0 — Restore Sympodial Successor Semantics in the 2.5D Experimental Base

Status: experimental reconciliation checkpoint. Do not merge to `main`.

## Why this checkpoint exists

JC demonstrated that persisted developmental depth can be used safely, but its renewal implementation drifted from the previously validated G vocabulary.

G defined mature order-4 renewal as **sympodial succession**:

- a fine tip may either continue on the same axis or renew into a fresh order-4 axis;
- continuation and renewal occupy the same single successor slot;
- renewal is not an additional lateral side fork;
- the old axis ends when renewal wins.

JC currently treats renewal as a side-branch-like event from a parent that already has continuation. That reintroduces the F semantics that were already rejected and also makes frontier diagnostics count some developmentally dead tips as living meristems.

JE0 repairs only that semantic regression while keeping JC's experimental 2.5D system unchanged.

## Locked from JC

JE0 must not change:

- accepted <=1,000 XY tree or zero-depth behavior;
- schema V3 / persisted `restDepth` experiment;
- mature XY and Z envelopes;
- XYZ candidate clearance;
- depth magnitude / tendency policy;
- mature global 64-structural-birth continuation window;
- 48-birth side-growth window;
- crown opportunity scoring (`crownGapScore`);
- structural cadence;
- leaf attachment, leaf form, LOD semantics, seasons, or UI.

## JE0 changes

1. Track `successorParents = continuation ∪ renewal`.
2. `axisTips` and continuation eligibility use `successorParents`, not continuation alone.
3. Renewal candidates come only from order-4 tips with no successor.
4. Renewal and continuation compete for that one tip; once either wins, the old meristem is consumed.
5. Renewal creates a new order-4 axis and uses G's gentler sympodial divergence (55% of ordinary fine lateral divergence).
6. Renewal curve start/taper uses the previously tested G successor treatment rather than lateral-fork treatment.
7. History diagnostics explicitly reject more than one successor child per parent.

## Acceptance / next question

JE0 itself is not a mature-policy acceptance candidate. It exists to make the 2.5D experimental base semantically trustworthy.

After JE0 is green, remeasure:

- scaffold coverage among living terminal meristems at 3k / 10k / 30k;
- largest scaffold share of the eligible frontier;
- candidate/frontier size;
- 3D crossing/clearance and depth use;
- long-life runtime and LOD budgets;
- browser morphology.

If accepted first-order scaffold lineages still disappear under the global 64-birth recency rule, the next experiment may replace only that global mature continuation cutoff with a bounded scaffold-balanced meristem reserve.
