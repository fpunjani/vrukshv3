# V3 Leaf Form V1

**Status:** active visual-development contract  
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
10. **No density rescue by deletion.** If 1000 full forms become unreadable, the failure belongs to renderer scale/LOD, not to identity or attachment history.
11. **Wood must remain readable.** A lush crown is not a license to hide broken hierarchy or turn the organism into one opaque blob.
12. **The 30 / 100 / 300 / 1000 shared-scale matrices remain the main human gate.** The same organism must progress from sparse juvenile foliage to an established crown without changing species midway.

## Derived family traits

A tree soul may derive a restrained set of foliage-family tendencies such as:

- base leaf length;
- width-to-length ratio;
- petiole scale;
- outward/forward bias;
- upward/light-seeking bias;
- tip fullness / silhouette tension.

These are renderer traits, not historical state.

## Per-identity variation

Entry identity may deterministically perturb the family within narrow ranges:

- leaf length;
- width;
- left/right asymmetry;
- petiole length;
- local angle jitter.

The same soul + entry + historical attachment must reproduce the same intrinsic leaf form.

## Geometry intent

V1 should use one restrained broadleaf family: a tapered, slightly asymmetric simple leaf rather than circles, generic ellipses, or decorative blobs.

The geometry should be described in framework-independent points/control points so React/SVG remains only a consumer.

A projected leaf should expose enough data to render:

- wood-surface origin;
- petiole end / leaf base;
- tip;
- left and right silhouette controls;
- optional midrib endpoints;
- intrinsic length/width and host order for diagnostics.

## Density policy for this checkpoint

The first implementation should render all identities through the 1000-entry Tree Lab gate. We should inspect the result before inventing clustering.

If density fails visually, the next response should be a renderer/LOD rule that preserves identity traceability. Do not change attachment assignment merely to make the first leaf renderer prettier.

## Automated acceptance

Leaf Form V1 must prove:

1. projected leaf count equals permanent identity count through 1000 entries;
2. all derived points and dimensions are finite;
3. dimensions stay positive and within bounded family ranges;
4. every leaf references the same historical host as its identity;
5. petiole origin is outside the current wood centerline in the identity's stored side direction;
6. deterministic replay produces identical derived leaf geometry;
7. different souls produce coherent but measurably different family traits;
8. status changes do not move or reshape the intrinsic leaf form;
9. existing structural, foliage-attachment, 30k longevity, build, and screenshot gates remain green.

## Human visual acceptance

At 30 / 100 / 300 / 1000 entries, inspect at least the eight identity souls and one timeline soul for:

- leaves visibly connected to wood;
- no obvious floating leaves;
- no repeated comb/fishbone pattern along every twig;
- no single universal angle across the canopy;
- no random-confetti orientation;
- believable size hierarchy between trunk/scaffold/twig hosts;
- bounded overlap rather than one solid crown mass;
- exposed enough wood to retain structural hierarchy;
- one coherent foliage family per soul;
- meaningful phenotype differences without looking like different species pasted together;
- no clipping at the shared view-box edges;
- continuity from juvenile to mature form.

A technically green build is not a visual PASS.

## Exit condition

Leaf Form V1 is accepted only when the derived geometry survives automated regression and the browser matrices read as believable connected foliage without using seasons, motion, flowers, texture, or decorative effects to compensate.
