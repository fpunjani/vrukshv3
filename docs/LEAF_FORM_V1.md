# V3 Leaf Form V1

**Status:** ACCEPTED — geometry checkpoint, including directional-naturalism correction  
**Scope:** derived leaf geometry, petiole attachment, deterministic variation, bearing, and 0–1000 visual QA  
**Out of scope:** seasons, motion, flowers, status art, final painterly texture, and product UI

Leaf Form V1 begins only after the plain wood skeleton and foliage-attachment checkpoints are accepted. It may make the organism legible as a leafy tree, but it may not rewrite either accepted layer.

## Core rules

1. **Schema V2 does not change.** Leaf silhouette, length, width, petiole geometry, orientation, color, and renderer detail remain derived presentation.
2. **Tree soul defines the family; entry identity defines the individual.** One organism should read as one botanical family, not a random collection of species.
3. **Every rendered leaf starts from its historical attachment.** The renderer projects the host module, normalized position, and side into the current curved wood before deriving any art.
4. **Petiole connection must be explicit.** A leaf may not float beside a branch or begin inside the branch centerline. It grows from the current wood surface through a short derived petiole.
5. **Permanent side remains meaningful.** Individual angle variation may soften repetition but may not casually flip an identity to the opposite side of its host.
6. **Branch tangent matters but does not dominate.** Orientation responds to the host's local growth direction without forcing the whole crown to follow upward-growing wood.
7. **Light seeking is a weak modifier, not a global instruction.** The renderer may gently lift distal foliage but may not make `up` the default posture of nearly every blade.
8. **Gravity/sag is allowed as derived presentation.** Basal and heavier-feeling foliage may carry modest downward bearing while preserving attachment identity.
9. **Variation is bounded.** Length, width, asymmetry, and orientation may vary enough to avoid cloning without turning the crown into visual noise.
10. **Early trunk-hosted identities remain valid.** They may render more modestly than twig-hosted foliage, but V1 may not re-host them.
11. **Status is visually neutral in V1.** Open/completed/archived identities use the same intrinsic leaf form so completion is not accidentally encoded as worth.
12. **No density rescue by deletion.** If full forms become unreadable, the failure belongs to renderer scale/LOD, not to identity or attachment history.
13. **Wood must remain readable.** A lush crown is not a license to hide broken hierarchy or turn the organism into one opaque blob.
14. **The 30 / 100 / 300 / 1000 shared-scale matrices remain the main human gate.** The same organism must progress from sparse juvenile foliage to an established crown without changing species midway.

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
- restrained forward-bearing tendency;
- restrained light-seeking tendency;
- restrained sag tendency;
- silhouette tip tension.

These are renderer traits, not historical state.

### Per-identity variation

Entry identity deterministically perturbs the family within bounded ranges:

- leaf length;
- width;
- left/right asymmetry;
- petiole length;
- local bearing jitter;
- small forward/light/sag variation.

The same soul + entry + historical attachment reproduces the same intrinsic form.

### Stable 2.5D phyllotactic projection

Rendering every identity in one 2D plane produced flat merged paddles on dense twigs. Leaf Form V1 therefore derives a stable phase around the supporting axis from:

- a deterministic module-specific offset;
- the identity's immutable birth event;
- a golden-angle progression.

It does **not** use the leaf's current rank among siblings, so future identities cannot renumber or rotate older leaves.

The projection exposes:

- `faceExposure` — how face-on versus foreshortened the blade appears;
- `depth` — a stable front/back ordering signal;
- an around-twig phase used by the bearing model.

Foreshortening changes only derived presentation. Historical attachment and stored side remain unchanged.

### Accepted bearing model

The original accepted Leaf Form solved the obvious fishbone/fern failure but a later close visual audit exposed a second problem: **too much of the crown still pointed upward**.

The cause was mechanical rather than artistic:

- branch tangent carried too much direction weight;
- every leaf received an explicit upward/light lift;
- distal foliage became even more tangent-forward;
- 2.5D phase altered exposure more than actual projected bearing.

That combination produced variation around an upward mean instead of a believable distribution around the twig.

The corrected model is:

1. permanent side-normal establishes where the identity belongs around the supporting wood;
2. stable phyllotactic phase modulates how much of that normal is visible in 2D;
3. edge-on leaves carry less screen-normal and more forward/back projected tangent;
4. basal foliage remains more lateral and receives modest sag;
5. distal foliage may sweep forward and receive a small light-seeking lift;
6. light seeking remains weak enough that upward is not the global default;
7. deterministic angle jitter remains secondary to the coherent bearing field;
8. a final weak side-preservation guard prevents a projected blade from crossing to the wrong historical side.

This gives the crown a mixture of upward, lateral, slightly backward-projected, and gently sagging foliage without changing attachment, schema, soul, or LOD membership.

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
9. an eight-soul directional guard rejects a return to a globally upward crown by requiring meaningful lateral/downward representation;
10. existing structural, foliage-attachment, 30k longevity, canopy-LOD, build, and browser gates remain green.

The directional guard is sampled at 300 entries rather than replaying another eight 1000-entry histories. Bearing itself is history-size-independent, while the separate 1000-entry geometry test and browser matrices still cover the mature visual horizon. This avoids making a visual regression test compete unnecessarily with the 128-soul structural stress gate.

## Human visual acceptance — PASS

The shared-scale browser matrices were inspected at 30 / 100 / 300 / 1000 entries across all eight identity souls plus the timeline soul.

Accepted observations after the bearing correction:

- petioles remain connected to current wood;
- no obvious floating foliage;
- the original normal-dominant fishbone failure is not the dominant silhouette;
- the later upward-forced posture is no longer the dominant crown read;
- upward, lateral, slight backward-projected, and gently sagging leaves coexist;
- opposite projected phases on the same supporting wood do not collapse into one screen direction;
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

### Tangent/light-heavy bearing

This was initially accepted because it solved the fishbone problem, but later visual inspection exposed an upward-default bias. Too many leaves inherited upward-growing branch tangent plus explicit light lift. The geometry remained deterministic and valid, but the botanical read was wrong, so the directional layer was reopened.

### First outward-first correction

Rejected as an overcorrection. It removed the upward fan but made side-normal too dominant, creating tidy perpendicular rows/comb-like runs on some twigs.

### Final phyllotactic bearing correction

Accepted. It keeps stored side binding while letting stable around-twig phase strongly modulate projected normal versus forward/back tangent. Modest basal sag and weak distal light seeking create a mixed bearing field without random packing.

### More random curvature / angle alone

Rejected as an incomplete fix. Larger angular noise weakens repetition but risks confetti and does not solve the directional field itself.

### Larger leaves alone

Useful for crown occupancy but insufficient by itself. Larger blades made dense planar groups merge into bigger paddles.

### Immediate clustering/LOD

Not used to solve Leaf Form directionality. Canopy LOD is a separate accepted scale layer and may not hide a bad close-detail bearing model.

## What this PASS does not mean

Leaf Form V1 is a **geometry checkpoint**, not final foliage art.

The current Tree Lab still intentionally uses simple flat diagnostic color and exposes wood strongly. It has not solved:

- final botanical palette;
- Shin-hanga / print texture;
- seasonal expression;
- wind or motion;
- flowers or completion art;
- final product composition.

Canopy representation above the close-detail horizon is handled by the separate accepted LOD checkpoint; it does not alter this intrinsic form.

## Exit condition

PASS. Derived leaf geometry survives automated regression and the browser matrices read as believable connected foliage with a mixed, phyllotactically coherent bearing field rather than an upward fan, perpendicular comb, or random confetti.

Seasonal expression may build on this corrected close-detail form without changing its historical attachment or intrinsic bearing identity.
