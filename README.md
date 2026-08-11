# Vruksh

Vruksh is being rebuilt around one core idea: **a person's history should create one persistent living organism over time**.

This repository is the clean V3 codebase. It intentionally excludes the V1/V2 generators, HomeShell, old backend, accumulated visual CSS, legacy infrastructure, and old Git history.

## Current state

V3 currently contains a Tree Lab and framework-independent domain engine rather than final product UI.

### Plain skeleton: accepted checkpoint

The structural baseline has persistent developmental history separated from rendered geometry, deterministic soul-keyed growth, append-only topology, established scaffold axes, mature light-seeking mechanics, true segment-to-segment clearance, tapered cubic wood, a 128-soul structural regression through 1,000 entries, curved-wood mechanical tests, and shared-scale browser gates.

Foliage may build on this wood **without hiding or rewriting it**.

### Foliage identity + historical attachment: accepted checkpoint

Every accepted entry owns one permanent foliage identity. Schema V2 persists only historical attachment facts:

- host growth module;
- normalized local position;
- stable local side;
- birth/status chronology.

World coordinates, leaf silhouette, size, color, season, motion, and level-of-detail remain derived presentation.

Attachment assignment is deterministic and history-size-independent. Earlier foliage is never rescanned or repacked. The checkpoint passed 1,000-entry identity invariants, 16-soul distribution gates, shared-scale browser inspection, and one-organism longevity reconstruction through 30,000 entries plus append of entry 30,001.

Tree Lab keeps `?attachments=1` as an intentionally plain QA view.

### Leaf Form V1: accepted geometry checkpoint

Schema V2 remains unchanged. Each identity now derives an actual simple broadleaf from its permanent attachment and the current curved wood.

The accepted leaf projection adds:

- one coherent soul-derived foliage family per organism;
- bounded entry-specific length, width, petiole, asymmetry, and bearing variation;
- a shared branch-local frame with current tangent, side-normal, thickness, and bark surface;
- explicit petiole connection to current wood;
- position-aware bearing: basal leaves are more lateral while distal leaves sweep forward;
- stable 2.5D phyllotactic projection derived from immutable birth chronology + module phase;
- face-on versus foreshortened presentation without changing historical attachment;
- a stable depth signal for later renderer layering;
- status-neutral intrinsic form;
- one projected leaf form for every permanent identity through the 1,000-entry visual gate.

The first normal-dominant prototype was rejected because it produced obvious fishbone/fern bands. Larger leaves and random angle alone were also insufficient. The accepted version passed the 30 / 100 / 300 / 1000 browser matrices across eight souls plus the timeline while keeping wood hierarchy visible and avoiding a solid green blob.

Tree Lab exposes this checkpoint with `?leaves=1`.

**Leaf Form V1 is not final foliage art.** The current flat green is diagnostic. Seasons, final palette, print texture, motion, flowers, and product composition remain downstream.

## Scale contract

**1,000 entries is a visual-development milestone, not a product maximum.**

The domain has no maximum-entry constant. Non-visual longevity QA reconstructs one organism at **3,000, 10,000, and 30,000 entries**, then appends entry 30,001.

Long-life QA verifies identity count, historical attachment validity, append-only history, structural invariants, coarse curved-wood mechanics, broad foliage distribution, and continued growth of the same organism.

The accepted 0–1,000 structural cadence remains unchanged. Beyond 1,000, mature structural opportunities thin on a square-root schedule so wood can keep growing for life without becoming linear in entry count.

30,000 is only the current stress target. It is not a cap.

## Architecture

### Persistent history

`TreeState` stores developmental facts: soul, chronology, leaf identities/attachment, module parentage, axis/order/birth relationships, and intrinsic rest growth.

It does **not** store SVG paths, world coordinates, apparent diameter, leaf silhouette, phyllotactic screen depth, wind transforms, palette, bark, or final foliage presentation.

### Structural growth

Growth events derive possible buds from the existing organism. Candidates compete using phenotype traits, apical dominance, branch order, bud readiness, available space, crown pressure, axis regulation, and deterministic variation.

### Derived geometry

History projects into structural chords for growth/collision decisions and separately into cubic tapered wood. Permanent foliage attachments project into branch-local frames and then into Leaf Form V1 geometry.

React/SVG consumes those derived points; it is not the tree model.

## Read first

- `docs/GROWTH_CONSTITUTION.md` — binding product/growth semantics.
- `docs/STRUCTURAL_ENGINE.md` — structural-engine design.
- `docs/SKELETON_ACCEPTANCE.md` — accepted engineering + human visual skeleton contract.
- `docs/FOLIAGE_CONSTITUTION.md` — binding foliage identity semantics.
- `docs/FOLIAGE_ATTACHMENT.md` — accepted attachment + longevity policy.
- `docs/LEAF_FORM_V1.md` — accepted individual-leaf geometry contract and visual evidence.
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
- `?count=1000&soul=ash-01&leaves=1`

## Verify

```bash
npm test
npm run build
```

CI renders browser matrices at 30, 100, 300, and 1000 entries for the plain skeleton, attachment-debug view, and Leaf Form V1.

## Working rules

1. Never make foliage or atmosphere compensate for structural failure.
2. Persistent history and derived geometry stay separate.
3. A growth/rendering change is not accepted because one hero soul looks good; it must survive multi-soul regression and the relevant browser gates.
4. Do not add infrastructure or UI dependencies without a concrete V3 requirement.
5. Keep the domain engine framework-independent. React is a consumer, not the tree model.
6. Identity is uncapped; renderer detail may scale down without deleting history.
7. Do not introduce seasons, wind, flowers, auth, cloud sync, analytics, or final product UI before the preceding rendering checkpoint is proven.

## Next checkpoint: canopy representation + LOD

The next problem is **not another leaf shape**. It is how an uncapped set of permanent identities should be represented at different screen scales.

The next checkpoint should define and prove:

- close view: accepted individual Leaf Form V1 remains directly inspectable;
- medium view: dense foliage may simplify or cluster without re-hosting identities;
- far view: canopy mass may represent many identities without pretending they were deleted;
- stable transitions between detail levels;
- traceability from a cluster back to its member entry identities;
- 1k / 3k / 10k / 30k rendering budgets that do not grow one SVG blade per historical entry forever;
- no visual jump that makes the organism appear to change identity when zoom or history size changes.

Only after that scale contract is proven should seasonal expression and final foliage art begin.
