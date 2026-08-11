# Mature Renewal F — Experimental Contract

Status: schema/developmental experiment. Do not merge on metrics alone.

## Why F exists

The accepted <=1,000 V3 tree is structurally credible. Long-life experiments established two separate truths:

- a bounded living frontier is necessary so historical wood does not remain an ever-growing ordinary candidate pool;
- mature fine wood needs a way to renew locally rather than forcing a terminal axis to elongate forever.

Experiments D and E showed that encoding every renewal as a normal lateral is not truthful: because lateral children must increase branch order, repeated renewal drives true order upward without bound. F introduces the smallest new developmental vocabulary needed to express the observed behavior honestly.

## New relation

`renewal` is a mature fine-wood side fork.

A renewal child:

- creates a new axis;
- preserves the parent's branch order;
- is available only on fine wood at the accepted terminal hierarchy (`order = 4`);
- is available only after the 1,000-entry structural-development horizon;
- uses the same side-branch slot as a normal lateral, so a parent can have at most one side child in addition to a continuation;
- uses lateral/fork geometry and taper behavior rather than continuation continuity;
- does not imply pruning, death, damage, reward, or user status.

It is not:

- a continuation, because it creates a new axis;
- a normal lateral, because it does not increase hierarchy;
- a persisted bud object;
- a renderer-only trick.

## Schema honesty

If F is accepted, `GrowthRelation` gains `renewal` and `TreeState.schemaVersion` moves from 2 to 3.

This is a pre-production schema experiment. A real production migration policy remains governed by the separate persistence/model-version contract; accepting F does not authorize silent replay of future users under new growth code.

## Living-frontier policy

Through entry 1,000, structural decision-making must remain unchanged.

After entry 1,000:

- a continuation can compete only when its axis was structurally active within the recent mature-tip window;
- a normal lateral can form only on recent living-crown wood and may not create a new order-1 scaffold from the trunk;
- a renewal can form only on recent order-4 wood near the same living frontier;
- old historical modules remain permanent but leave ordinary developmental competition when they become dormant.

The frontier is derived from immutable history. No persistent active/dormant flag is added in F.

## Structural invariants

For every non-root module:

### continuation
- same axis as parent;
- same order as parent.

### lateral
- new axis;
- order = parent order + 1.

### renewal
- new axis;
- order = parent order;
- parent order must be 4;
- born after the 1,000-entry horizon.

A parent may have:
- at most one continuation child;
- at most one side child, where side child means `lateral` or `renewal`.

Therefore max structural children remains 2.

## Mechanical interpretation

Renewal belongs to the same fine-twig mechanical family as order-4 lateral wood:

- same fine length family;
- lateral-like junction tangent;
- lateral-like start-diameter cap;
- same collision and crown-envelope constraints;
- no special upward/light target in this experiment.

F changes developmental topology and eligibility only. It deliberately does not retune light, curvature, branch angle, cadence, foliage, or LOD.

## Acceptance gates

F is acceptable only if all agree:

1. **<=1k preservation** — accepted module geometry/history through 1,000 remains unchanged apart from the schema tag.
2. **Schema invariants** — renewal is valid only under the rules above; malformed renewal histories are diagnosed.
3. **Bounded hierarchy** — max branch order remains 4 at 3k/10k/30k.
4. **Bounded frontier** — stale ordinary side growth and long axis resumption are strongly reduced.
5. **Terminal renewal** — order-4 axes no longer absorb mature development mainly as long continuation chains.
6. **Performance** — the existing 30k longevity test remains inside its current 60-second budget; no timeout increase.
7. **LOD** — existing medium/far budgets remain unchanged; topology must not force us to loosen them.
8. **Wood mechanics** — collision, taper, continuation continuity, side-fork diameter, and below-ground diagnostics remain clean.
9. **Human morphology** — 3k/10k/30k browser gates read as one old, continuously branched organism rather than poles, bouquets, sparse towers, a runaway hedge, or a flat fan.
10. **No metric-only acceptance** — numerical improvement cannot override a worse visual organism.

## Explicit non-goals

F does not add:

- pruning/disturbance reactivation;
- explicit persisted buds or frontier state;
- branch death/abscission;
- 2.5D wood/depth;
- seasons, motion, rhythm, or final art;
- backend persistence or product UI.

If an explicit same-tier renewal relation plus a bounded frontier still cannot produce a convincing long-life crown, the next architectural question is whether strict planar/non-crossing wood is the limiting assumption.