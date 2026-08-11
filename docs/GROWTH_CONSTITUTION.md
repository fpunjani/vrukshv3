# Vruksh V3 Growth Constitution

Status: **binding product contract for V3**

The purpose of this document is to stop visual implementation from silently redefining what Vruksh means. If a renderer, animation, storage decision, or growth heuristic conflicts with this document, the implementation changes first.

## 1. The core promise

Vruksh is a personal growth log represented by one living tree.

The tree is not a score, streak meter, reward machine, or decorative chart. It is a persistent organism whose visible history is created by the user's intentions and actions over time.

The central invariant is:

> **Tree N+1 must be the same organism as Tree N, with new growth. It may not be a newly generated replacement for Tree N.**

## 2. Permanent identity

Every tree has a persistent `soul`.

The soul controls stable tendencies such as lean, branching preference, asymmetry, crown character, and small deterministic variation. It must never decide whether the user is "good" or "bad" at Vruksh.

Two users with identical histories may have different-looking trees because their souls differ. The same user must retain recognizable structural identity across years and seasons.

Soul must produce **coherent traits**, not merely a stream of unrelated random numbers. Randomness can vary local growth, but stable phenotype-level tendencies belong to the tree itself.

## 3. Every entry matters

Every accepted entry receives a permanent visual identity.

For V3 the canonical identity is a `LeafIdentity` keyed by the immutable entry ID. It records when that identity entered the tree and its current entry state. A renderer may use level-of-detail or aggregation when thousands of leaves exist, but the underlying identity is never discarded merely because the entry became old.

Therefore:

- entry #1 still belongs to the tree at entry #1000;
- old entries do not vanish because a freshness window expired;
- recent entries may be easier to inspect, but recency is a presentation concern, not existence;
- rendering fewer leaves for performance must never mutate the tree's history.

## 4. Entry state is not tree worth

An entry may be open, completed, or archived.

These states alter how that entry is expressed, not whether it deserves to exist.

### Open

The intention is active. Its leaf remains alive and inspectable.

### Completed

Completion must create a positive state change without deleting the original identity. Later art direction may express this through leaf character, a bud, flower, fruit, mark, or another restrained botanical signal.

### Archived

Archive means "not currently foregrounded." It is not failure and does not erase history. Archived identity remains in the tree data even if the renderer visually quiets it.

## 5. No punishment for inactivity

Vruksh must never portray a healthy long-term user as unhealthy simply because their all-time history is large relative to their last few weeks of activity.

Inactivity may produce dormancy, stillness, fewer new buds, or seasonal quiet. It must not retroactively shrink, damage, shame, or invalidate permanent growth.

There is no `recent / lifetime` vitality score.

## 6. Five independent growth axes

The visual system must keep these concepts separate instead of collapsing them into one maturity number.

### A. Structural history

Driven by cumulative growth events. It is permanent and append-only at the level of **topology and birth decisions**: axes, growth modules, parent-child relationships, branch order, and intrinsic growth parameters.

Structural growth becomes progressively less frequent as the tree matures. Entry #800 should still matter, but a mature tree should not need 800 large branches.

### B. Calendar age

Driven by real elapsed time since the tree began. Age may influence bark character, trunk mass, subtle irregularity, old wood, root confidence, secondary thickening, and other long-term signals.

Age and activity are not interchangeable. A three-year-old tree with 200 thoughtful entries should not be equivalent to a three-month-old tree with 200 entries.

### C. Current rhythm

Driven by recent activity patterns. Rhythm is reversible and surface-level. It may influence buds, tender leaves, new-shoot emphasis, or subtle animation energy.

Rhythm must not rewrite structural history.

### D. Entry state

Open/completed/archived belongs to each individual entry identity. This affects the botanical expression of that identity, not the user's global worth.

### E. Season

Season is a reversible appearance layer. It may change foliage, flowers, colour, shedding, and atmosphere. It may never alter permanent structural history or soul identity.

## 7. Persistent history is not frozen world geometry

V3 stores the **developmental record** of the tree, not a pile of final SVG coordinates.

A structural module should preserve facts such as:

- what it grew from;
- which axis it belongs to;
- whether it continued an axis or created a lateral axis;
- its botanical order;
- when it was born;
- its intrinsic/rest growth parameters.

World-space points, curve control points, apparent thickness, age-related sag, and motion transforms are derived projections of that history.

This distinction is essential. It allows the same old branch to thicken with age, inherit movement from its parent, or respond to a deterministic mechanical model without pretending that a different branch existed in the past.

Derived geometry may evolve only from explicit axes such as calendar age, load, season-independent mechanics, or animation. It may **not** be opportunistically rewritten to make today's silhouette prettier.

## 8. Growth must be append-only

A growth event may:

- extend an existing active axis;
- create a new lateral axis from an eligible growth point;
- create a new structural module, twig, or shoot;
- create a new permanent entry/leaf identity;
- update the presentation state of an existing entry identity.

A growth event may not:

- change the parent of an old module;
- change whether an old module was a continuation or lateral branch;
- change an old module's birth event merely to improve today's silhouette;
- regenerate the entire tree from aggregate counts;
- change old keyed decisions because the current entry count changed;
- replace one soul with another;
- delete old history to keep the tree visually convenient.

This is both a product rule and a testable engineering invariant.

## 9. Growth event ordering is part of history

A persistent organism requires deterministic chronology.

The same set of entries must not produce a different historical tree merely because a database returned rows in a different order. Replay must use a canonical immutable ordering, primarily `createdAt` and a stable tie-breaker.

Normal live growth is chronological append. Importing an older historical entry is a replay/migration operation, not a silent append to the present-day tip.

Each permanent entry identity therefore records the growth-event index at which it entered the organism.

## 10. Growth rate must be sublinear

Early growth should be legible and emotionally rewarding. Mature growth should become more nuanced rather than endlessly adding large limbs.

The broad progression is qualitative rather than a rigid level system:

- **0** — potential / seed
- **1–3** — emergence
- **4–14** — establishing a young axis
- **15–50** — recognizable young tree
- **50–150** — crown formation and secondary structure
- **150–500** — established tree; denser secondary and tertiary growth
- **500–1500** — mature refinement; fewer major structural events, more local character
- **1500+** — continued history through fine growth, age, foliage identity, completion state, and long-term morphology rather than uncontrolled branch count

These are diagnostic ranges, not badges shown to users.

## 11. Structural plausibility comes before decoration

The skeleton must survive inspection without foliage or atmosphere.

Before V3 is allowed to add its final art direction, the generator must demonstrate:

- coherent trunk hierarchy;
- believable taper;
- branch attachment continuity;
- asymmetric but balanced crown development;
- global spread constraints;
- avoidance of pathological self-crossing and repetitive forks;
- recognizable identity across growth milestones;
- meaningful variation across souls without random chaos.

If the skeleton fails, foliage, grain, fog, glow, texture, and colour are not valid fixes.

## 12. Motion follows hierarchy

Motion is not a global rotation.

When motion work begins:

- trunk base should be nearly anchored;
- upper trunk may flex slightly;
- major limbs respond slowly and with low amplitude;
- smaller branches respond more;
- twigs and leaves carry the fastest, smallest-scale response;
- connected parts inherit parent motion with delay and damping.

Reduced-motion users must receive a calm static presentation without losing meaning.

## 13. Seasons preserve identity

A winter tree and summer tree must still be recognizably the same organism.

Winter may reveal structure more strongly. Summer may obscure some branch detail with foliage. Neither may swap the underlying structural history.

Hemisphere and climate handling are product decisions to be made explicitly before season becomes production-critical; month-to-season mapping must not be silently hardcoded as universal truth.

## 14. Persistence must be honest

If Vruksh says a tree remembers years of a person's life, persistence cannot fail silently.

Production V3 must distinguish clearly between:

- durable stored state;
- locally cached state;
- temporary/demo state.

A storage failure must never make the app appear safely persisted when it is actually running only in memory.

Persisted tree history must be schema-versioned so future growth-engine migrations can be explicit rather than silently reinterpret years of user history.

## 15. The empty state must be truthful

A new user starts with their own beginning, not fabricated memories.

Demo trees may exist, but demo data must be explicitly labelled as demo data and must never silently become the user's history.

## 16. Tree Lab is part of the product engineering system

The Tree Lab is not a temporary toy. It is the primary regression environment for the tree engine.

At minimum it must support:

- multiple deterministic souls side-by-side;
- entry milestones from 0 through at least 1000;
- the same soul shown across time;
- shared-scale views so automatic framing cannot hide size/silhouette problems;
- quantitative geometry diagnostics across 100+ souls;
- later: age controls;
- later: entry-state distributions;
- later: season controls;
- later: viewport/mobile checks;
- later: automated screenshot regression.

A change to growth logic is not considered safe because one hero tree looks good.

## 17. Current V3 checkpoint rules

The first skeleton prototype intentionally does **not** attempt final beauty.

The foundation is responsible for proving these architectural claims:

1. each accepted entry receives one permanent leaf identity;
2. old leaf identities are retained indefinitely in state;
3. structural topology and birth decisions are append-only;
4. deterministic decisions are keyed by soul + stable event identity;
5. later event counts never cause earlier historical decisions to be regenerated;
6. structural growth frequency becomes less frequent as event count rises;
7. Tree Lab compares multiple souls and the same soul across milestones;
8. present-day drawing geometry is projected from persistent history instead of being the history itself.

The current branch-selection algorithm is disposable. These invariants are not.

## 18. Definition of success before visual polish

We do not move into foliage/art-direction work until the structural engine can pass all of the following:

- 100+ deterministic souls can be generated without invalid topology or non-finite geometry;
- every milestone state is a strict historical/topological extension of its previous state;
- the same tree is visibly recognizable at 10, 30, 100, 300, and 1000 entries;
- trees have meaningful variation without converging to one generic crown;
- pathological self-crossing/crowding remains within explicit diagnostic limits;
- branch hierarchy and taper respond coherently as descendants accumulate;
- no single seed is required to make the engine look convincing;
- the skeleton is aesthetically credible in plain ink on a plain background.

That is the point at which Vruksh earns the right to become beautiful.
