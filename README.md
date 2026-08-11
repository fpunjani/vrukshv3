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

Schema V2 remains unchanged. Each identity derives one accepted simple-broadleaf form from its permanent attachment and current curved wood.

The accepted projection includes:
- one coherent soul-derived foliage family per organism;
- bounded entry-specific variation;
- branch-local tangent/normal/thickness/bark-surface frames;
- explicit petiole connection;
- position-aware bearing;
- stable 2.5D phyllotactic exposure/depth derived from immutable birth chronology + module phase;
- status-neutral intrinsic form.

The normal-dominant fishbone prototype, random-angle-only fix, and larger-leaf-only fix were rejected before the final browser PASS. A later audit corrected a remaining global upward-bearing bias without changing historical attachment or schema.

Tree Lab exposes the accepted individual geometry with `?leaves=1`.

### Canopy representation + LOD: accepted identity-scale checkpoint

Permanent identity is uncapped, so whole-tree rendering cannot require one full blade per historical entry forever.

The accepted derived hierarchy is:

`entry identity -> medium module bucket -> far axis-band bucket`

- **Close / individual:** accepted Leaf Form V1 for each identity.
- **Medium / module:** `moduleId + side + 4 fixed attachment-position bins`.
- **Far / axis:** `axisId + side + 4 persistent modules per historical axis band`.

Bucket membership is deterministic, exact, traceable, nested, and append-stable. Future entries may join an existing bucket, but they cannot move an older identity to another bucket.

The current medium/far diagnostic uses the earliest historical member as a stable representative. The **membership contract is accepted**, but the pre-season audit now treats that particular geometric anchor as provisional pending a topology-based spatial-fidelity comparison.

Measured long-history compression for the regression soul:

| Entries | Structural modules | Medium | Far |
| ---: | ---: | ---: | ---: |
| 3,000 | 234 | 994 | 167 |
| 10,000 | 471 | 2,017 | 368 |
| 30,000 | 857 | 3,749 | 614 |

A dedicated `?long=1` Tree Lab mode reconstructs one organism once and compares medium vs far from the exact same `TreeState`. Browser gates at 3k / 10k / 30k pass without constructing 30,000 individual blades.

Canopy LOD is **not final canopy art**. Current ellipses/colors are diagnostic representations of accepted identity-scale semantics.

### Pre-season foundation audit: active checkpoint

Before adding seasonal styling, V3 is deliberately auditing whether the accepted layers are strong enough for a lifetime product rather than only a 0–1,000-entry visual demo.

The audit has already found and corrected two concrete issues on its branch:

- live append chronology did not fully match canonical `(createdAt, ID)` replay ordering for equal timestamps;
- old duplicate entry IDs were only guaranteed idempotent at the current tip rather than at the domain boundary.

It also identified two deeper areas that require measurement before further art direction:

- **mature growth-front behavior after 1,000 entries** — long-history QA currently proves validity/scale more strongly than old-tree morphology;
- **LOD geometric anchoring** — stable bucket membership is sound, but earliest-leaf representative geometry may not be the best spatial anchor for a large persistent wood neighbourhood.

Season work is paused until these are explicitly gated. See `docs/PRE_SEASON_FOUNDATION_AUDIT.md`.

## Scale contract

**1,000 entries is a visual-development milestone, not a product maximum.**

The domain has no maximum-entry constant. Non-visual longevity QA reconstructs one organism at **3,000, 10,000, and 30,000 entries**, then appends entry 30,001.

Long-life QA verifies identity count, historical attachment validity, append-only history, structural invariants, curved-wood mechanics, broad foliage distribution, stable LOD membership, bounded primitive counts, and finite 30k cluster geometry.

The accepted 0–1,000 structural cadence remains unchanged. Beyond 1,000, mature structural opportunities thin on a square-root schedule so wood can keep growing for life without becoming linear in entry count.

30,000 remains a stress target, not a cap. The pre-season audit adds the missing question: **does that valid long-lived structure still mature convincingly, not merely remain technically legal?**

## Architecture

### Persistent history

`TreeState` stores developmental facts: soul, chronology, leaf identities/attachment, module parentage, axis/order/birth relationships, and intrinsic rest growth.

It does **not** store SVG paths, world coordinates, apparent diameter, leaf silhouette, phyllotactic screen depth, LOD membership, cluster geometry, wind transforms, palette, bark, or final foliage presentation.

### Structural growth

Growth events derive possible buds from the existing organism. Candidates compete using phenotype traits, apical dominance, branch order, bud readiness, available space, crown pressure, axis regulation, and deterministic variation.

### Derived presentation

History projects into structural chords and cubic tapered wood. Permanent foliage attachments project into branch-local frames and Leaf Form V1. Canopy LOD then derives stable medium/far buckets without mutating history.

React/SVG consumes those derived structures; it is not the tree model.

## Read first

- `docs/GROWTH_CONSTITUTION.md` — binding product/growth semantics.
- `docs/PRE_SEASON_FOUNDATION_AUDIT.md` — current audit, risks, and checkpoint order.
- `docs/STRUCTURAL_ENGINE.md` — structural-engine design.
- `docs/SKELETON_ACCEPTANCE.md` — accepted 0–1,000 skeleton contract.
- `docs/FOLIAGE_CONSTITUTION.md` — binding foliage identity semantics.
- `docs/FOLIAGE_ATTACHMENT.md` — accepted attachment + longevity policy.
- `docs/LEAF_FORM_V1.md` — accepted individual-leaf geometry.
- `docs/CANOPY_LOD.md` — accepted uncapped identity-scale representation semantics.
- `AGENTS.md` — product and visual design intent; Growth Constitution takes precedence on meaning.

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
- `?count=1000&soul=ash-01&lod=module`
- `?count=1000&soul=ash-01&lod=axis`
- `?long=1&count=30000&soul=ash-01`

## Verify

```bash
npm test
npm run build
```

CI renders:
- skeleton / attachment / individual-leaf matrices at 30 / 100 / 300 / 1000;
- medium/far LOD identity matrices at 300 / 1000;
- one-organism medium-vs-far long-history gates at 3k / 10k / 30k.

The next foundation work will add multi-soul post-1k morphology evidence without turning every normal PR into an unnecessarily expensive 30k sweep.

## Working rules

1. Never make foliage or atmosphere compensate for structural failure.
2. Persistent history and derived geometry stay separate.
3. A growth/rendering change is not accepted because one hero soul looks good; it must survive multi-soul regression and the relevant browser gates.
4. Do not add infrastructure or UI dependencies without a concrete V3 requirement.
5. Keep the domain engine framework-independent. React is a consumer, not the tree model.
6. Identity is uncapped; renderer detail may scale down without deleting history.
7. LOD may simplify representation but may never re-host, delete, or renumber historical identities.
8. Do not introduce product infrastructure simply to compensate for deterministic-model inefficiency.
9. **An accepted checkpoint locks its contract, not every coefficient or diagnostic rendering trick.** Replace derived implementation details when stronger evidence exists; do not rewrite the historical truths downstream work relies on.
10. Product guidance must not describe tree size, activity, completion, season, or visual richness as a measure of user worth.

## Next checkpoint: mature foundation before seasonal expression

The season contract is useful and remains available on `v3-season-expression`, but implementation is paused.

The immediate sequence is:

1. merge the foundation integrity corrections;
2. add Mature Frontier V1 diagnostics and multi-soul long-history morphology QA while preserving accepted 0–1,000 history;
3. test a stable topology-derived LOD geometric anchor without changing bucket membership;
4. define the time/persistence/model-version contract, including when calendar age begins;
5. resume reversible seasonal expression.

Only then should Vruksh layer entry-state expression, recent-rhythm cues, motion, final Shin-hanga-inspired botanical treatment, and product UI/backend around a foundation we can defend for years rather than just for the current screenshots.
