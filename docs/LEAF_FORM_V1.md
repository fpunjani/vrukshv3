# V3 Leaf Form V1

**Status:** ACCEPTED — geometry checkpoint  
**Scope:** derived leaf geometry, petiole attachment, deterministic variation, and 0–1000 visual QA  
**Out of scope:** seasons, motion, flowers, status art, production clustering, painterly texture, and product UI

Leaf Form V1 begins only after the plain wood skeleton and foliage-attachment checkpoints are accepted. It may make the organism legible as a leafy tree, but it may not rewrite either accepted layer.

## Core rules

1. **Schema V2 does not change.** Leaf silhouette, length, width, petiole geometry, orientation, color, and renderer detail remain derived presentation.
2. **Tree soul defines the family; entry identity defines the individual.** One organism should read as one botanical family, not a random collection of species.
3. **Every rendered leaf starts from its historical attachment.** The renderer projects the host module, normalized position, and side into the current curved wood before deriving any art.
4. **Petiole connection must be explicit.** A leaf may not float beside a branch or begin inside the branch centerline. It grows from the current wood surface through a short derived petiole.
5. **Permanent side remains meaningful.** Individual angle variation may soften repetition but may not casually flip an identity to the opposite side of its host.
6. **Branch tangent matters.** Orientation should respond to the host's local growth direction rather than using screen-space random rotation.
7. **Variation is bounded.** Length, width, asymmetry, and orientation may vary enough to avoid cloning without turning the crown into visual noise.
8. **Early trunk-hosted identities remain valid.** They may render more modestly than twig-hosted foliage, but V1 may not re-host them.
9. **Status is visually neutral in V1.** Open/completed/archived identities use the same leaf form so completion is not accidentally encoded as worth.
10. **No density rescue by deletion.** If full forms become unreadable, the failure belongs to renderer scale/LOD, not to identity or attachment history.
11. **Wood must remain readable.** A lush crown is not a license to hide broken hierarchy or turn the organism into one opaque blob.
12. **The 30 / 100 / 300 / 1000 shared-scale matrices remain the main human gate.** The same organism must progress from sparse juvenile foliage to an established crown without changing species midway.

## Accepted derived model

### Branch-local frame

Every identity is first projected into a current branch-local frame containing:

- historical module and attachment position;
- current cubic-wood anchor;
- current tangent;
- historical side-aware normal;
- current branch thickness;
- current bark-surface point.

The leaf renderer consumes this frame. It does not duplicate branch geometry or persist world coordinates.

### Soul-level family

The tree soul derives one restrained simple-broadleaf family controlling:

- base leaf length;
- width-to-length ratio;
- petiole scale;
- forward-bearing tendency;
- light-seeking tendency;
- silhouette tip tension.

These are renderer traits, not historical state.

### Per-identity variation

Entry identity deterministically perturbs the family within bounded ranges:

- leaf length;
- width;
- left/right asymmetry;
- petiole length;
- local bearing jitter.

The same soul + entry + historical attachment reproduces the same intrinsic form.

### Positional bearing

The first normal-dominant prototype failed visually because dense host modules became obvious fishbone/fern bands.

The accepted model makes bearing a gradual function of the identity's already-persistent normalized position on the supporting module:

- leaves nearer the module base bear more laterally;
- leaves nearer the module tip sweep more forward with the supporting axis;
- small identity variation softens the fan without replacing it with random rotation.

This keeps local variation coherent rather than noisy.

### Stable 2.5D phyllotactic projection

Rendering every identity in one 2D plane still produced flat merged paddles on dense twigs. The accepted model therefore derives a stable phase around the supporting axis.

The phase uses:

- a deterministic module-specific offset;
- the identity's immutable birth event;
- a golden-angle progression.

It does **not** use the leaf's current rank among siblings, so future identities cannot renumber or rotate older leaves.

The 2D projection exposes:

- `faceExposure` — how face-on versus foreshortened the blade appears;
- `depth` — a stable front/back ordering signal for later renderer layering.

Foreshortening changes only derived presentation. Historical attachment and stored side remain unchanged.

## Geometry

V1 uses one tapered, slightly asymmetric simple broadleaf rather than circles, generic ellipses, or decorative blobs.

Each projected leaf exposes framework-independent geometry for:

- wood-surface petiole origin;
- petiole end / leaf base;
- tip;
- left and right cubic silhouette controls;
- local direction;
- derived length, width, and petiole length;
- face exposure and depth.

React/SVG is a consumer of those points, not the source of leaf semantics.

## Automated acceptance — PASS

The accepted branch proves:

1. projected leaf count equals permanent identity count through 1000 entries;
2. all derived points and dimensions are finite and bounded;
3. every leaf references the same historical host and position as its identity;
4. petiole origin is derived from the current bark surface on the stored side;
5. deterministic replay produces identical derived leaf geometry;
6. different souls produce coherent but measurably different family traits;
7. status changes do not move or reshape intrinsic leaf form;
8. 2.5D exposure/depth for an existing identity remains unchanged when future identities arrive;
9. existing structural, foliage-attachment, 30k longevity, build, and browser gates remain green.

## Human visual acceptance — PASS

The shared-scale browser matrices were inspected at 30 / 100 / 300 / 1000 entries across all eight identity souls plus the timeline soul.

Accepted observations:

- petioles remain connected to current wood;
- no obvious floating foliage;
- the original normal-dominant fishbone failure is no longer the dominant silhouette;
- bearings vary coherently without random-confetti orientation;
- trunk-hosted historical identities remain more modest than canopy-bearing foliage;
- overlap remains bounded rather than collapsing into one solid green mass;
- major wood hierarchy remains visible beneath foliage;
- all souls read as one restrained foliage family with phenotype variation, not pasted-together species;
- no obvious shared-view clipping was observed;
- the timeline reads as sparse juvenile foliage developing into a mature, still-airy crown.

## Rejected iterations

### Normal-dominant bearing

Rejected because the branch normal dominated leaf direction, producing repeated fern/fishbone bands that exposed the attachment system.

### More random curvature / angle alone

Rejected as an incomplete fix. Larger angular noise weakened repetition but risked confetti and did not solve the planar crowding mechanism.

### Larger leaves alone

Useful for crown occupancy but insufficient by itself. Larger blades made dense planar groups merge into bigger paddles.

### Immediate clustering/LOD

Not adopted for this checkpoint. The accepted 2.5D projection remains legible through 1000 identities while rendering every identity, so deletion/thinning was not needed to pass Leaf Form V1.

## What this PASS does not mean

Leaf Form V1 is a **geometry checkpoint**, not final foliage art.

The current Tree Lab still intentionally uses simple flat diagnostic color and exposes wood strongly. It has not solved:

- production screen-space density above the 1000-entry visual horizon;
- 3k / 10k / 30k visual representation;
- zoom-dependent clustering or level of detail;
- final botanical palette;
- Shin-hanga / print texture;
- seasonal expression;
- wind or motion;
- flowers or completion art;
- final product composition.

Those concerns must not be folded back into persistent leaf identity or attachment just to make the renderer prettier.

## Exit condition

PASS. Derived leaf geometry survives automated regression and the browser matrices read as believable connected foliage without seasons, motion, flowers, texture, or decorative rescue effects.

The next rendering checkpoint should address **canopy representation and LOD across scale**, while preserving the accepted individual Leaf Form V1 as the close-detail representation.
