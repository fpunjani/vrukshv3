# Mature Renewal G — Sympodial Successor Experiment

Status: schema/developmental experiment. Do not merge on metrics alone.

## Hypothesis

Long-life V3 needs two things simultaneously:

1. a bounded living frontier so historical wood does not remain an ever-growing candidate pool;
2. a truthful way for mature fine shoots to change developmental axis without multiplying active shoot systems or increasing hierarchy forever.

F proved that `renewal` as an additional same-tier side fork is wrong: the parent can continue while the renewal branch also survives, so mature order-4 shoot systems proliferate and the crown becomes a vertical procedural scrawl.

G changes only that meaning.

## Renewal is a successor, not a side branch

For mature fine wood (`order = 4`) a parent has one **successor slot**.

That slot can be filled by exactly one of:

- `continuation`: same axis, same order;
- `renewal`: new axis, same order.

If renewal wins, the old axis ends at that parent. The renewal child becomes the new fine-axis successor. A parent can never have both continuation and renewal.

Normal `lateral` remains a side-branch relation:

- new axis;
- order = parent order + 1;
- available only below order 4.

Therefore renewal does not add another simultaneous mature shoot. It changes which axis continues the developmental path.

## Schema

If G is accepted:

- `GrowthRelation` gains `renewal`;
- `TreeState.schemaVersion` moves from 2 to 3.

Renewal invariants:

- parent exists and predates child;
- child axis differs from parent axis;
- child order equals parent order;
- parent/child order must be 4;
- child is born after entry 1,000;
- parent has no continuation child and no second renewal child.

## Mature frontier

Through entry 1,000, structural decisions must remain unchanged.

After entry 1,000:

- successor candidates come only from axes active within the recent mature-tip window;
- ordinary lateral candidates come only from recent living-crown wood;
- no ordinary new order-1 scaffold is created from old trunk buds;
- renewal may compete only at recent, established order-4 tips.

Historical wood remains permanent but does not remain ordinary developmental opportunity forever.

## Renewal mechanics

G is not an angle-tuning experiment, but renewal needs a physical successor direction.

- ordinary continuation uses the existing continuation mechanics unchanged;
- renewal starts from the current terminal tip;
- its heading deviates modestly from the old axis using a bounded fraction of the existing fine-lateral divergence family;
- it is a new axis, so it does not claim exact continuation diameter/tangent continuity;
- its junction remains finer than the parent tip but less abrupt than a full lateral fork.

No mature tropism/light coefficient is changed in G.

## Acceptance

G must satisfy all of the following:

1. module/leaf history through 1,000 unchanged apart from schema tag;
2. max branch order remains 4 through 30k;
3. no parent has both continuation and renewal;
4. stale mature side activation and very long axis resumption are strongly reduced;
5. order-4 axes stop becoming long persistent terminal chains;
6. renewal does not proliferate active shoot count like F;
7. existing 30k runtime budget stays unchanged;
8. existing LOD budgets are not loosened merely to accommodate renewal;
9. curved wood remains collision/taper safe;
10. 3k/10k/30k browser gates read as one continuously branching old organism, not poles, ribbons, bouquets, a flat fan, or a sparse tower system.

If G produces good biology but far LOD alone fails because axis identity now records sympodial succession, LOD may be revised only if its new grouping preserves exact entry coverage, append stability, and the same visual organism. That would be a representation-layer correction, not a reason to erase renewal history.

## Non-goals

No persisted buds/frontier state, pruning, death, seasons, motion, 2.5D wood, backend, or product UI.