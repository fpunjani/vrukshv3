import { projectFoliageFrames } from "./foliage-geometry";
import { keyedRange } from "./random";
import type { EntryStatus, Point, TreeState } from "./types";

export interface LeafFamilyTraits {
  baseLength: number;
  widthRatio: number;
  petioleScale: number;
  forwardBias: number;
  lightBias: number;
  tipTension: number;
}

export interface ProjectedLeafForm {
  entryId: string;
  moduleId: string;
  status: EntryStatus;
  bornAtEvent: number;
  order: number;
  side: -1 | 1;
  stemOrigin: Point;
  base: Point;
  tip: Point;
  leftControl1: Point;
  leftControl2: Point;
  rightControl1: Point;
  rightControl2: Point;
  direction: Point;
  length: number;
  width: number;
  petioleLength: number;
}

export function deriveLeafFamilyTraits(soul: string): LeafFamilyTraits {
  return {
    baseLength: keyedRange(soul, "leaf-family:length", 4.5, 5.8),
    widthRatio: keyedRange(soul, "leaf-family:width-ratio", 0.32, 0.44),
    petioleScale: keyedRange(soul, "leaf-family:petiole", 1.15, 1.75),
    forwardBias: keyedRange(soul, "leaf-family:forward-bias", 0.18, 0.31),
    lightBias: keyedRange(soul, "leaf-family:light-bias", 0.08, 0.2),
    tipTension: keyedRange(soul, "leaf-family:tip-tension", 0.44, 0.64),
  };
}

function normalize(vector: Point): Point {
  const magnitude = Math.max(1e-9, Math.hypot(vector.x, vector.y));
  return { x: vector.x / magnitude, y: vector.y / magnitude };
}

function rotate(vector: Point, degrees: number): Point {
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return {
    x: vector.x * cos - vector.y * sin,
    y: vector.x * sin + vector.y * cos,
  };
}

function offset(point: Point, direction: Point, distance: number): Point {
  return {
    x: point.x + direction.x * distance,
    y: point.y + direction.y * distance,
  };
}

function combine(
  normal: Point,
  tangent: Point,
  forwardBias: number,
  lightBias: number,
): Point {
  const outwardWeight = Math.max(0.55, 1 - forwardBias);
  return normalize({
    x: normal.x * outwardWeight + tangent.x * forwardBias,
    y: normal.y * outwardWeight + tangent.y * forwardBias - lightBias,
  });
}

function orderLengthScale(order: number): number {
  if (order <= 0) return 0.68;
  if (order === 1) return 0.84;
  if (order === 2) return 1;
  if (order === 3) return 1.05;
  return 0.98;
}

function orderPetioleScale(order: number): number {
  if (order <= 0) return 0.76;
  if (order === 1) return 0.9;
  if (order === 2) return 1;
  if (order === 3) return 1.04;
  return 1;
}

export function projectLeafForms(state: TreeState): ProjectedLeafForm[] {
  const family = deriveLeafFamilyTraits(state.soul);

  return projectFoliageFrames(state).map((frame) => {
    const key = `leaf-form:${frame.entryId}`;
    const forwardBias = Math.max(
      0.1,
      Math.min(
        0.38,
        family.forwardBias + keyedRange(state.soul, `${key}:forward`, -0.045, 0.045),
      ),
    );
    const lightBias = Math.max(
      0.02,
      Math.min(
        0.26,
        family.lightBias + keyedRange(state.soul, `${key}:light`, -0.035, 0.035),
      ),
    );
    const baseDirection = combine(
      frame.normal,
      frame.tangent,
      forwardBias,
      lightBias,
    );
    const angleJitter = keyedRange(state.soul, `${key}:angle`, -10.5, 10.5);
    let direction = normalize(rotate(baseDirection, angleJitter));

    // Bounded jitter may soften repetition, but a leaf must remain on its
    // historical side of the host. Pull it back toward the side-normal if an
    // extreme local tangent would otherwise make the direction ambiguous.
    const sideDot = direction.x * frame.normal.x + direction.y * frame.normal.y;
    if (sideDot < 0.42) {
      direction = normalize({
        x: direction.x * 0.55 + frame.normal.x * 0.45,
        y: direction.y * 0.55 + frame.normal.y * 0.45,
      });
    }

    const length =
      family.baseLength *
      orderLengthScale(frame.order) *
      keyedRange(state.soul, `${key}:length`, 0.86, 1.14);
    const width =
      length *
      family.widthRatio *
      keyedRange(state.soul, `${key}:width`, 0.92, 1.08);
    const petioleLength =
      family.petioleScale *
      orderPetioleScale(frame.order) *
      keyedRange(state.soul, `${key}:petiole`, 0.88, 1.12);
    const asymmetry = keyedRange(state.soul, `${key}:asymmetry`, -0.085, 0.085);
    const leftWidth = width * (1 + asymmetry);
    const rightWidth = width * (1 - asymmetry);

    const stemOrigin = frame.surface;
    const base = offset(stemOrigin, direction, petioleLength);
    const tip = offset(base, direction, length);
    const perpendicular = { x: -direction.y, y: direction.x };
    const shoulder = 0.2 + (1 - family.tipTension) * 0.055;
    const upper = 0.6 + family.tipTension * 0.075;

    const leftControl1 = {
      x: base.x + direction.x * length * shoulder + perpendicular.x * leftWidth * 0.44,
      y: base.y + direction.y * length * shoulder + perpendicular.y * leftWidth * 0.44,
    };
    const leftControl2 = {
      x: base.x + direction.x * length * upper + perpendicular.x * leftWidth,
      y: base.y + direction.y * length * upper + perpendicular.y * leftWidth,
    };
    const rightControl2 = {
      x: base.x + direction.x * length * upper - perpendicular.x * rightWidth,
      y: base.y + direction.y * length * upper - perpendicular.y * rightWidth,
    };
    const rightControl1 = {
      x: base.x + direction.x * length * shoulder - perpendicular.x * rightWidth * 0.44,
      y: base.y + direction.y * length * shoulder - perpendicular.y * rightWidth * 0.44,
    };

    return {
      entryId: frame.entryId,
      moduleId: frame.moduleId,
      status: frame.status,
      bornAtEvent: frame.bornAtEvent,
      order: frame.order,
      side: frame.side,
      stemOrigin,
      base,
      tip,
      leftControl1,
      leftControl2,
      rightControl1,
      rightControl2,
      direction,
      length,
      width,
      petioleLength,
    };
  });
}
