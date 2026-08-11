# Vruksh

Vruksh is being rebuilt around one core idea: **a person's history should create one persistent living organism over time**.

This codebase is the clean V3 foundation. It intentionally excludes the V1/V2 generators, HomeShell, old backend, accumulated visual CSS, and legacy infrastructure.

## Current state

The project currently contains a structural Tree Lab rather than product UI.

Proven so far:

- persistent developmental history separated from rendered geometry;
- one permanent leaf identity per accepted entry;
- deterministic soul-keyed growth;
- self-organizing continuation/lateral bud competition;
- apical dominance, branch-order and axis-length regulation;
- hard structural crossing rejection and soft crown pressure;
- derived tangent-continuous cubic wood;
- derived variable-width taper rather than fixed SVG strokes;
- 128-soul structural regression across 1, 3, 10, 30, 100, 300 and 1000 entries;
- rendered-wood collision, taper and diameter-continuity checks;
- clean CI for install, tests, TypeScript and Vite build.

The automated skeleton gate passes. Human/browser visual acceptance is the next gate before foliage.

## Architecture

### Persistent history

`TreeState` stores developmental facts only: soul, chronology, leaf identities, module parentage, axis/order/birth relationships, and intrinsic rest growth.

It does **not** store SVG paths, world coordinates, apparent diameter, wind transforms, color, bark, or foliage presentation.

### Structural growth

Growth events derive possible buds from the existing organism. Candidates compete using phenotype traits, apical dominance, branch order, persistent bud readiness, available space, crown pressure, axis regulation and deterministic variation.

### Derived geometry

History is projected into cheap structural chords for growth/collision decisions and separately into cubic, tapered wood for rendering. Geometry may improve without rewriting a user's historical tree.

## Read first

- `docs/GROWTH_CONSTITUTION.md` — binding product/growth semantics.
- `docs/STRUCTURAL_ENGINE.md` — structural-engine design and rationale.
- `docs/SKELETON_ACCEPTANCE.md` — the current engineering and visual acceptance boundary.
- `AGENTS.md` — product and visual design intent.

## Run

```bash
npm ci
npm run dev
```

Tree Lab runs on `http://localhost:3417`.

## Verify

```bash
npm test
npm run build
```

## Working rules

1. Never make foliage or atmosphere compensate for structural failure.
2. Persistent history and derived geometry stay separate.
3. A growth change is not accepted because one hero seed looks good; it must survive the multi-soul regression gate.
4. Do not add infrastructure or UI dependencies without a concrete V3 requirement.
5. Keep the domain engine framework-independent. React is a consumer, not the tree model.
6. Do not introduce auth, cloud sync, analytics, final art direction, seasons or motion before the preceding checkpoint is proven.

## Next gate

Run the Tree Lab in a real browser and judge the plain tapered skeleton across the identity matrix and growth timeline. If the skeleton passes human visual review, freeze it and begin **foliage identity and placement** as a separate layer.
