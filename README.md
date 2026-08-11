# Vruksh

Vruksh is being rebuilt around one core idea: **a person's history should create one persistent living organism over time**.

This repository is the clean V3 codebase. It intentionally excludes the V1/V2 generators, HomeShell, old backend, accumulated visual CSS, legacy infrastructure, and old Git history.

## Current state

V3 currently contains a Tree Lab and framework-independent domain engine rather than final product UI.

### Plain skeleton: accepted checkpoint

The current structural baseline has:

- persistent developmental history separated from rendered geometry;
- deterministic soul-keyed growth;
- append-only axis/branch topology;
- durable first-order scaffold establishment before secondary branching;
- declining leader priority as crown formation begins;
- coherent axis-specific light seeking after scaffold establishment;
- branch-order-specific lateral divergence;
- true segment-to-segment non-local structural clearance;
- derived tangent-continuous cubic wood and variable-width taper;
- 128-soul structural regression across 1, 3, 10, 30, 100, 300, and 1000 entries;
- rendered-wood collision, taper, tangent, and diameter-continuity checks;
- browser screenshot gates at shared scale.

The earlier pole-with-twigs visual failure is no longer the current structural checkpoint. Foliage is now allowed to proceed **without being allowed to hide or rewrite the accepted wood**.

## Current checkpoint: foliage identity and historical attachment

Every accepted entry owns one permanent foliage identity. In tree schema V2 that identity stores only historical attachment facts:

- persistent host growth module;
- normalized local position on that module;
- stable local side;
- existing birth/status chronology.

World coordinates, leaf silhouette, size, color, season, motion, and level-of-detail remain derived presentation.

Attachment assignment is deterministic and history-size-independent: new identities compete across eligible current wood using structural signals plus soul/entry/module-keyed rendezvous variation. Earlier foliage is never rescanned or repacked.

Tree Lab exposes neutral attachment marks with `?attachments=1`. They are QA marks, not approved leaf art.

## Scale contract

**1,000 entries is a visual-development milestone, not a product maximum.**

The domain has no maximum-entry constant. Non-visual longevity QA reconstructs one organism at **3,000, 10,000, and 30,000 entries**, then appends entry 30,001. Long-life QA checks exact identity count, historical attachment validity, append-only prefixes, sublinear wood growth, broad foliage distribution, and continued growth of the same organism.

30,000 is only the current stress target. Passing it does not create a maximum; later QA may move the stress horizon higher without changing the domain contract.

At future rendering scales, many permanent identities may be clustered or omitted by level-of-detail without being deleted from domain history.

## Architecture

### Persistent history

`TreeState` stores developmental facts: soul, chronology, leaf identities and attachment, module parentage, axis/order/birth relationships, and intrinsic rest growth.

It does **not** store SVG paths, world coordinates, apparent diameter, wind transforms, color, bark, or final foliage presentation.

### Structural growth

Growth events derive possible buds from the existing organism. Candidates compete using phenotype traits, apical dominance, branch order, bud readiness, available space, crown pressure, axis regulation, and deterministic variation.

### Derived geometry

History is projected into cheap structural chords for growth/collision decisions and separately into cubic, tapered wood for rendering. Foliage attachment is likewise projected from historical module/position/side into current wood geometry.

## Read first

- `docs/GROWTH_CONSTITUTION.md` — binding product/growth semantics.
- `docs/STRUCTURAL_ENGINE.md` — structural-engine design.
- `docs/SKELETON_ACCEPTANCE.md` — engineering + human visual skeleton contract.
- `docs/FOLIAGE_CONSTITUTION.md` — binding foliage identity/attachment semantics.
- `docs/FOLIAGE_ATTACHMENT.md` — current attachment implementation and longevity policy.
- `AGENTS.md` — product and visual design intent.

## Run

```bash
npm ci
npm run dev
```

Tree Lab runs on `http://localhost:3417`.

Examples:

- `?count=300&soul=ash-01`
- `?count=1000&soul=ash-01&attachments=1`

The interactive visual lab intentionally focuses on 0–1000 entries; larger histories are handled by non-visual longevity QA until a production LOD renderer exists.

## Verify

```bash
npm test
npm run build
```

CI also renders browser screenshots at 30, 100, 300, and 1000 entries for both the plain skeleton and neutral attachment-debug view.

## Working rules

1. Never make foliage or atmosphere compensate for structural failure.
2. Persistent history and derived geometry stay separate.
3. A growth or foliage change is not accepted because one hero seed looks good; it must survive multi-soul regression and the relevant browser gates.
4. Do not add infrastructure or UI dependencies without a concrete V3 requirement.
5. Keep the domain engine framework-independent. React is a consumer, not the tree model.
6. Identity is uncapped; renderer detail may scale down without deleting history.
7. Do not introduce seasons, wind, final foliage art, auth, cloud sync, analytics, or product UI before the preceding checkpoint is proven.

## Next checkpoint

After foliage attachment itself is accepted, begin **Leaf Form V1**:

- one restrained leaf geometry family;
- deterministic per-identity variation;
- size/orientation derived from host branch and attachment;
- believable petiole connection;
- enough overlap/LOD discipline to avoid turning 1000 identities into a green blob;
- no seasons, atmosphere, flowers, or decorative rescue layer yet.
