# Vruksh

Vruksh is being rebuilt around one core idea: **a person's history should create one persistent living organism over time**.

This repository is the clean V3 codebase. It intentionally excludes the V1/V2 generators, HomeShell, old backend, accumulated visual CSS, legacy infrastructure, and old Git history.

## Current state

V3 currently contains a structural Tree Lab rather than product UI.

Proven so far:

- persistent developmental history separated from rendered geometry;
- one permanent leaf identity per accepted entry;
- deterministic soul-keyed growth;
- self-organizing continuation/lateral bud competition;
- append-only axis/branch topology;
- hard structural crossing rejection and soft crown pressure;
- derived tangent-continuous cubic wood;
- derived variable-width taper rather than fixed SVG strokes;
- 128-soul structural regression across 1, 3, 10, 30, 100, 300, and 1000 entries;
- rendered-wood collision, taper, tangent, and diameter-continuity checks;
- clean Node 24 CI for `npm ci`, tests, TypeScript/Vite build, and deterministic browser screenshots.

### Current verdict: automated PASS, visual FAIL

The automated structural and rendered-wood gates pass. Browser inspection of the shared-scale 30 / 100 / 300 / 1000-entry Tree Lab matrices does **not** yet pass.

The current engine creates valid branches, but mature trees still tend to read as elongated leaders with short lateral shoots. Lateral axes do not persist strongly enough to establish convincing scaffold limbs and sub-crowns. Foliage is therefore blocked.

See `docs/SKELETON_ACCEPTANCE.md` for the full visual diagnosis.

## Architecture

### Persistent history

`TreeState` stores developmental facts only: soul, chronology, leaf identities, module parentage, axis/order/birth relationships, and intrinsic rest growth.

It does **not** store SVG paths, world coordinates, apparent diameter, wind transforms, color, bark, or foliage presentation.

### Structural growth

Growth events derive possible buds from the existing organism. Candidates compete using phenotype traits, apical dominance, branch order, bud readiness, available space, crown pressure, axis regulation, and deterministic variation.

### Derived geometry

History is projected into cheap structural chords for growth/collision decisions and separately into cubic, tapered wood for rendering. Geometry may improve without rewriting a user's historical tree.

## Read first

- `docs/GROWTH_CONSTITUTION.md` — binding product/growth semantics.
- `docs/STRUCTURAL_ENGINE.md` — structural-engine design and current failure analysis.
- `docs/SKELETON_ACCEPTANCE.md` — engineering + human visual acceptance contract.
- `AGENTS.md` — product and visual design intent.

## Run

```bash
npm ci
npm run dev
```

Tree Lab runs on `http://localhost:3417`.

URL-addressable QA states are supported, for example `?count=300&soul=ash-01`.

## Verify

```bash
npm test
npm run build
```

CI additionally renders browser screenshots at 30, 100, 300, and 1000 entries.

## Working rules

1. Never make foliage or atmosphere compensate for structural failure.
2. Persistent history and derived geometry stay separate.
3. A growth change is not accepted because one hero seed looks good; it must survive the multi-soul regression and browser gates.
4. Do not add infrastructure or UI dependencies without a concrete V3 requirement.
5. Keep the domain engine framework-independent. React is a consumer, not the tree model.
6. Do not introduce auth, cloud sync, analytics, final art direction, seasons, motion, or foliage before the preceding checkpoint is proven.

## Next checkpoint

Build **scaffold/crown structural development** without changing the historical model:

- establish several durable first-order scaffold axes;
- give young lateral axes enough continuation vigor to become limbs rather than one-off shoots;
- reduce indefinite trunk elongation after crown formation begins;
- let established axes develop their own secondary hierarchy;
- direct growth toward under-filled crown regions without predrawing a mature tree;
- preserve deterministic replay, append-only history, collision safety, taper, and multi-soul QA.

Only after the plain skeleton passes the human visual gate does Vruksh move to foliage identity and placement.
