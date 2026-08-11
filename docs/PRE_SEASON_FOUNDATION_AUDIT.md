# Vruksh V3 — Pre-Season Foundation Audit

**Date:** August 11, 2026  
**Status:** ACTIVE — blocking new seasonal implementation  
**Purpose:** verify that the clean V3 restart is strong enough to carry a long-lived product before more presentation layers make foundational mistakes harder to see.

## Verdict

The restart is directionally sound and should **not** be restarted again.

The strongest decisions are architectural:

- one persistent organism rather than regenerated snapshots;
- append-only historical topology and foliage identity;
- strict separation between persistent history and derived drawing geometry;
- one permanent identity per accepted entry;
- deterministic soul/identity keyed decisions;
- status, season, age, rhythm, and structural history kept conceptually separate;
- plain structural and attachment gates before decorative art;
- uncapped identity with derived LOD rather than history deletion;
- Tree Lab and long-history QA as permanent engineering tools.

Those are the right bones for Vruksh.

However, the audit found several places where an implementation that is locally valid could become a lifetime-product mistake if we declare every lower layer permanently locked too early. Seasonal rendering is therefore paused until the foundation issues below are resolved or explicitly bounded.

## 1. Historical chronology — correctness blocker

### Problem found

Canonical replay orders entries by:

`createdAt -> entry ID`

The previous live append path rejected only an entry with an earlier timestamp. Two different entries sharing a timestamp could therefore be accepted live in an order that canonical replay would later reverse.

That violates the central product promise: durable reconstruction must reproduce the organism the user actually grew.

The previous live append path also treated only an immediate tip retry as idempotent, delegating older duplicate protection entirely to future storage.

### Audit correction

The audit branch now:

- uses the same `(createdAt, ID)` chronology comparison for live append and replay;
- rejects a same-timestamp historical insertion that belongs before the current tip;
- treats any previously accepted entry ID as idempotent at the domain boundary;
- adds regression tests for both cases.

Storage must still enforce uniqueness, but persistence safety should use defense in depth.

## 2. Product psychology — language drift blocker

### Problem found

`AGENTS.md` still contained language describing the tree as reflecting “progress,” rewarding attention, and making growth feel like accomplishment.

That wording conflicts with the binding Growth Constitution, which explicitly says Vruksh is not a score, streak, reward machine, or measure of user worth.

Even if the implementation is currently correct, ambiguous agent guidance is a future product bug: a later contributor can innocently reintroduce gamified completion, inactivity punishment, or a bigger-tree-equals-better-person hierarchy.

### Audit correction

The design guide now makes the Growth Constitution authoritative and frames the product around:

- grounded continuity;
- memory and accumulated history;
- equal-worth states;
- rich but non-gamified expression;
- delight without a reward economy.

## 3. Long-life structural development — not sufficiently gated yet

### What is already good

The accepted 0–1,000 structural engine is substantially stronger than the abandoned V1/V2 direction:

- young trees establish persistent first-order scaffolds;
- trunk dominance declines during crown formation;
- branch order and divergence create visible hierarchy;
- true segment clearance prevents structural cheating;
- 128 deterministic souls are tested through the 1,000-entry visual-development horizon;
- after 1,000 entries structural opportunity is thinned sublinearly;
- one organism survives reconstruction through 30,000 entries without topology corruption.

### Gap found

The long-life test currently proves **validity and scale**, not mature developmental morphology.

The 128-soul morphology sweep stops at 1,000 entries. The 3k / 10k / 30k longevity gate uses one regression soul and primarily checks:

- history retention;
- valid attachments;
- no crossings / below-ground growth;
- bounded module and LOD counts;
- finite cluster geometry;
- append-only continuation.

Those are necessary, but they do not prove that a 30,000-entry tree still develops like an old tree.

Current structural candidates are derived from historical modules that remain eligible when they have an unused continuation/lateral opportunity. There is no explicit mature-frontier diagnostic describing which old buds/tips should remain developmentally active versus dormant/spent.

The current 30k diagnostic is therefore a warning, not an accepted mature-tree art target: persistent narrow/vertical shoots become visually prominent enough that the organism can begin to read as a dense shoot system rather than an old scaffold tree with new growth concentrated at living fronts.

### Required next checkpoint: Mature Frontier V1

Do **not** rewrite the accepted 0–1,000 tree first.

The safest experiment boundary is:

- preserve every 0–1,000 historical decision exactly;
- add diagnostics for post-1,000 structural development;
- measure before setting thresholds;
- change mature candidate regulation only if the measurements and browser gate support it.

Required diagnostics should include at least:

- age of the parent wood selected by each new post-1,000 structural module;
- axis dormancy gap before reactivation;
- distribution of recent structural growth by branch order;
- orientation distribution of recent mature shoots;
- crown width/height change from 1k -> 3k -> 10k -> 30k;
- persistence of the original major scaffold hierarchy;
- concentration of new growth near current axis fronts versus deep historical wood.

The long-life morphology gate must cover multiple deterministic souls, not one hero/regression soul. The most expensive 30k sweep may be a separate extended workflow rather than slowing every PR.

Do not introduce persistent bud state merely because it sounds botanical. First test whether a derived mature-frontier policy can solve the observed failure while preserving history. Persist new developmental state only if it represents a historical fact that cannot be reconstructed honestly from existing history.

## 4. Canopy LOD — semantic grouping accepted, geometric anchor provisional

### What remains accepted

The semantic hierarchy remains strong:

`entry identity -> module bucket -> axis-band bucket`

Keep:

- exact identity coverage;
- exact traceability;
- append-stable membership;
- no re-hosting;
- deterministic nesting;
- structural-complexity render budgets.

### Risk found

Current medium/far cluster geometry uses the **earliest historical leaf in a bucket** as the geometric representative.

This was a reasonable way to avoid the opposite failure: calculating a centroid from current members would move an old cluster whenever a new identity joined it.

But earliest-member anchoring has its own weakness. A far bucket can accumulate many identities while its center/orientation remain visually inherited from one old leaf. The cluster is historically stable but may become a poor spatial representation of the persistent wood neighbourhood it represents.

### Required next checkpoint: Topological Anchor V1

Keep bucket membership unchanged. Prototype only derived geometry.

Prefer a stable anchor derived from the persistent supporting topology itself—for example the module neighbourhood / axis band and its current projected wood frame—rather than:

- a current-member centroid;
- a screen-space packing result;
- the orientation of one arbitrary old leaf.

Acceptance must prove both:

1. append stability; and
2. spatial fidelity to the structural neighbourhood represented by the bucket.

This is a renderer/projection improvement, not a history/schema change.

## 5. Persistence and replay — model version still needs an explicit contract

`schemaVersion` answers: “what shape does stored state have?”

It does **not** fully answer: “which growth semantics created this state?”

Before Vruksh stores real user histories, define an explicit growth-model/migration policy so an algorithm improvement cannot silently reinterpret an old history just because the JSON shape stayed compatible.

The production persistence contract must decide:

- stored-state schema version;
- growth-model version / migration identity;
- whether production loads stored developmental state directly or canonically replays source entries under the historical model version;
- how migrations are validated and rolled back;
- what happens if reconstruction fails;
- uniqueness and transaction boundaries for accepted entry IDs.

Do not claim durable memory to users until this is implemented.

## 6. Calendar age needs its own historical anchor

The Growth Constitution correctly separates cumulative activity from real elapsed age, but the current engine does not yet have a durable “tree began at” fact.

`TreeState` currently contains structural/entry chronology, not an explicit planted/began timestamp. A zero-entry tree therefore cannot age truthfully, and a high-activity young tree currently projects the same structural age as an equally active old tree.

Before implementing age-driven bark, mass, sag, or old-wood character, decide explicitly when the organism's calendar life begins:

- tree creation;
- first accepted entry;
- or another product-defined event.

Do not infer this accidentally from the current oldest leaf if the product wants a tree to exist before its first entry.

This likely belongs in the next schema/persistence contract, not in seasonal rendering.

## 7. What remains locked vs what remains replaceable

### Binding / keep

- Growth Constitution semantics;
- permanent soul;
- permanent entry identities;
- append-only topology/birth facts;
- historical foliage host/position/side;
- canonical chronology;
- history vs projection separation;
- equal-worth entry states;
- no inactivity punishment;
- uncapped identity;
- traceable LOD semantics;
- 0–1,000 accepted structural history unless a future audit finds a genuine blocker.

### Replaceable / still open to evidence

- exact mature post-1,000 candidate scoring;
- whether mature frontier state is derived or eventually persisted;
- exact leaf-bearing coefficients;
- diagnostic canopy mass geometry;
- earliest-member cluster anchoring;
- final LOD thresholds/crossfades;
- age mechanics;
- seasonal palette/expression;
- status art;
- motion;
- final rendering technology and texture.

A checkpoint being accepted means downstream work may rely on its **contract**. It does not mean every coefficient or diagnostic SVG primitive has become sacred.

## Recommended sequence from here

1. **Foundation integrity PR** — canonical live chronology, duplicate defense, product-language alignment, this audit.
2. **Mature Frontier V1** — add post-1k diagnostics and multi-soul long-life morphology gates; prototype mature-front regulation only after measurement.
3. **Topological Anchor V1** — keep LOD membership, improve stable spatial projection.
4. **Time + persistence contract** — planted/began time, schema/model-version policy, durable reconstruction rules.
5. **Seasonal expression** — return to the existing season contract on top of the audited foundation.
6. **Entry-state + rhythm expression** — prove them independently before combining.
7. **Hierarchical motion + final botanical/print art**.
8. **Production UI/backend** only when the product can truthfully persist and reconstruct the organism it presents.

## Research rationale

Vruksh does not need to become a scientific simulator. The useful lesson from procedural-botany research is narrower:

- realistic tree architecture benefits from competition among developing buds/branches for space/light plus internal developmental regulation;
- space-colonization approaches likewise obtain tree structure by mediating branch growth through available space;
- developmental models separate growth rules/history from final rendered appearance.

Relevant primary references:

- Palubicki et al., *Self-organizing tree models for image synthesis*, ACM TOG 2009 — https://algorithmicbotany.org/papers/selforg.sig2009.html
- Runions, Lane & Prusinkiewicz, *Modeling Trees with a Space Colonization Algorithm*, 2007 — https://algorithmicbotany.org/papers/colonization.egwnp2007.html
- Prusinkiewicz, *Modeling plant growth and development*, 2004 — https://algorithmicbotany.org/papers/mpg.copb2004.html

The takeaway is not “copy a paper.” It is: keep the current persistent developmental architecture, and strengthen the mature developmental-front model where our own long-life diagnostics show it is weak.

## Exit condition

Season implementation may resume when:

- the chronology/idempotency correction is merged and green;
- mature-front diagnostics exist and the current post-1k algorithm has either passed them or been improved without rewriting the accepted 0–1,000 history;
- LOD geometric anchoring has an explicit keep/replace decision backed by a spatial-fidelity gate;
- the persistence/time/model-version decisions are documented clearly enough that seasonal work cannot accidentally become another hidden history axis.

The goal is not to freeze more code. The goal is to freeze the **right truths** before the product becomes expensive to change.
