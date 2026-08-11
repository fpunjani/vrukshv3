# V3 Seasonal Expression

**Status:** active semantic checkpoint  
**Depends on:** accepted skeleton, foliage attachment, corrected Leaf Form V1, and canopy LOD  
**Scope:** reversible season input and present-day foliage expression across individual / medium / far representations

Season is the first explicitly reversible appearance layer in V3.

It must make the organism feel alive in time without turning climate, inactivity, completion, or geography into a hidden score.

## Core invariant

> **Season changes how the current organism is expressed. It never changes what historical organism exists.**

The same `TreeState` viewed in spring, summer, autumn, or winter must retain identical:
- soul;
- growth index;
- structural modules;
- topology and birth history;
- leaf identities;
- leaf attachment host / position / side;
- corrected Leaf Form V1 intrinsic identity geometry inputs;
- medium/far LOD bucket membership and keys.

## Geography / climate boundary

The tree domain must **not** infer season directly from month, latitude, locale, or hemisphere.

That mapping belongs to a product-level season provider because:
- Northern and Southern hemispheres are opposite;
- tropical / arid climates do not fit one universal four-season calendar;
- future user preference or aesthetic modes may intentionally differ from local weather;
- hardcoding month -> season inside the organism would turn a product choice into tree history.

The presentation layer therefore receives an explicit season signal.

## Continuous season signal

Avoid hard switching one whole tree from `summer` to `autumn` on a date boundary.

Use a normalized season mixture:

```ts
interface SeasonMix {
  spring: number;
  summer: number;
  autumn: number;
  winter: number;
}
```

Rules:
- each weight is finite and clamped to `[0, 1]`;
- normalized weights sum to 1;
- a pure season is one weight = 1;
- transitions blend adjacent seasons smoothly;
- the product-level season provider decides how time/geography becomes these weights.

This model keeps renderer semantics independent from calendar policy.

## Season is separate from the other four axes

Do not use season as a proxy for:
- **structural history** — cumulative permanent growth;
- **calendar age** — years since the organism began;
- **current rhythm** — recent activity/dormancy energy;
- **entry state** — open / completed / archived.

Examples:
- an inactive user in July is not automatically “winter”;
- a completed entry is not automatically autumn/gold;
- an old leaf is not automatically brown because of age;
- a young tree in winter is still a young tree.

## Individual identity expression

Corrected Leaf Form V1 remains the intrinsic close-detail geometry.

Season may derive reversible presentation around that form, such as:
- blade prominence;
- saturation / hue family;
- lightness/value;
- edge contrast;
- subtle size/presence transform;
- vein / bud / trace emphasis;
- depth opacity;
- later: seasonal shedding expression.

Season may **not**:
- modify permanent attachment;
- choose a different host;
- mutate intrinsic Leaf Form V1 parameters or its accepted bearing field;
- change phyllotactic phase;
- renumber identities;
- delete identity history.

## Winter identity rule

Winter may reveal more wood and visually quiet foliage, but it must not make old entries cease to exist.

If the final winter art reduces blade prominence substantially, each permanent identity must still remain recoverable through one of:
- a restrained bud / node / trace at close detail;
- the accepted LOD cluster membership at medium/far detail;
- direct interaction/inspection metadata.

A winter view is a reversible presentation, not a data-pruning operation.

## Stable per-identity variation

A perfectly uniform seasonal recolour will look synthetic.

Small within-season variation may be keyed by:
- tree soul for family-level seasonal character;
- immutable entry ID for individual variation;
- permanent attachment / host order for local context.

It must **not** depend on current total entry count or current sibling rank, because future history would recolour old identities unpredictably.

## Cross-LOD coherence

The same season signal must drive close, medium, and far representations coherently.

### Close / individual

May show the richest seasonal detail per identity.

### Medium / module

A cluster style should represent the same seasonal family without calculating full hidden member blade geometry first.

### Far / axis

A canopy mass should carry the same seasonal progression at a coarser level while preserving scaffold identity.

LOD bucket keys and membership do not change with season.

A zoom/detail change must not make the organism appear to jump into a different season.

## Entry state neutrality during this checkpoint

Open / completed / archived semantics remain present in `TreeState`, but the first seasonal checkpoint should keep intrinsic seasonal colour/presence **status-neutral**.

Reason:
- we need to prove season independently;
- completion requires its own positive botanical expression contract;
- archive requires quieting without implying failure;
- combining state and season immediately would make failures hard to diagnose.

Status expression may layer on later without changing the season model.

## Current rhythm neutrality during this checkpoint

Recent activity/rhythm is also intentionally held neutral while season is validated.

Dormancy belongs to rhythm; winter belongs to season. They may eventually reinforce each other visually, but the renderer must first prove it can keep them conceptually independent.

## First diagnostic seasonal characters

These are **semantic targets**, not final palette values.

### Spring
- fresh / tender / luminous;
- slightly lighter, younger presence;
- restrained new-growth energy;
- no implication that spring is “better” than other seasons.

### Summer
- full / saturated / settled;
- strongest ordinary blade presence;
- calm abundance rather than neon reward-state green.

### Autumn
- warm / varied / mature;
- gold / amber / warm-green / restrained russet range may emerge;
- not a “decay / failure” state.

### Winter
- quiet / structural / spare;
- wood hierarchy comes forward;
- blade prominence can reduce strongly;
- permanent identity remains recoverable and reversible.

## Automated acceptance

Before final art direction, prove:

1. season projection does not mutate `TreeState`;
2. pure season inputs are deterministic;
3. normalized blends are deterministic and finite;
4. returning to the same season reproduces exactly the same expression;
5. changing season does not alter corrected Leaf Form V1 identity count or intrinsic geometry/bearing;
6. changing season does not alter medium/far bucket keys or membership;
7. append-only history does not change old identities' intrinsic seasonal variation keys;
8. open/completed/archived changes do not alter the season-only intrinsic style during this checkpoint;
9. season expression works at 1,000 identities without requiring persistent style state;
10. medium/far season style at 30k remains O(visible LOD primitives), not O(all hidden individual blade geometry);
11. all accepted skeleton / attachment / leaf / LOD / longevity gates remain green.

## Browser acceptance

Add explicit Tree Lab season controls/URLs independent from date.

At minimum inspect:
- spring / summer / autumn / winter at 1,000 entries;
- at least one transition blend (e.g. 50% summer / 50% autumn);
- the same soul across all pure seasons using one shared view box;
- multiple souls in at least summer and autumn;
- medium/far LOD under the same season signal;
- a 30k far winter/summer comparison without individual-blade rendering.

Reject if:
- season changes silhouette because identities moved hosts;
- winter looks like punishment or tree death;
- autumn reads as “failed / stale” rather than seasonal warmth;
- pure season palettes make different souls look like unrelated species;
- a season switch causes a cluster membership jump;
- close / medium / far look like different seasonal systems;
- transition blends create muddy/grey accidental states;
- final styling is used to conceal structural or LOD failure.

## Not yet in scope

Do not add in this checkpoint:
- automatic month/hemisphere mapping;
- live weather integration;
- recent-activity dormancy;
- completion flowers/fruit;
- archived-entry quieting;
- wind;
- final print grain / Shin-hanga texture;
- atmospheric background;
- product UI;
- persistence/auth/backend.

## Exit condition

Seasonal expression is accepted only when one unchanged organism can move reversibly through explicit season inputs at close, medium, far, and long-history views while preserving permanent identity and without implying moral value through season.

Only after this semantic/palette checkpoint passes should Vruksh layer entry-state expression, current-rhythm cues, motion, and final art texture.
