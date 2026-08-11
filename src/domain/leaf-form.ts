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
  position: number;
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
    baseLength: keyedRange(soul, "leaf-family:length", 7.4, 9.2),
    widthRatio: keyedRange(soul, "leaf-family:width-ratio", 0.32, 0.43),
    petioleScale: keyedRange(soul, "leaf-family:petiole", 1.2, 1.75),
    forwardBias: keyedRange(soul, "leaf-family:forward-bias", 0.52, 0.66),
    lightBias: keyedRange(soul, "leaf-family:light-bias", 0.1, 0.22),
    tipTension: keyedRange(soul, "leaf-family:tip-tension", 0.52, 0.7),
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
  const tangentWeight = Math.max(0.48, Math.min(0.7, forwardBias));
  const normalWeight = 1 - tangentWeight;
  return normalize({
    x: normal.x * normalWeight + tangent.x * tangentWeight,
    y: normal.y * normalWeight + tangent.y * tangentWeight - lightBias,
  });
}

function orderLengthScale(order: number): number {
  // Early trunk identities remain visible but modest. The actual canopy-bearing
  // orders are allowed enough blade area to occupy the space around sparse wood.
  if (order <= 0) return 0.58;
  if (order === 1) return 0.78;
  if (order === 2) return 1;
  if (order === 3) return 1.06;
  return 1;
}

function orderPetioleScale(order: number): number {
  if (order <= 0) return 0.72;
  if (order === 1) return 0.88;
  if (order === 2) return 1;
  if (order === 3) return 1.05;
  return 1;
}

export function projectLeafForms(state: TreeState): ProjectedLeafForm[] {
  const family = deriveLeafFamilyTraits(state.soul);

  return projectFoliageFrames(state).map((frame) => {
    const key = `leaf-form:${frame.entryId}`;
    const forwardBias = Math.max(
      0.45,
      Math.min(
        0.72,
        family.forwardBias + keyedRange(state.soul, `${key}:forward`, -0.055, 0.055),
      ),
    );
    const lightBias = Math.max(
      0.03,
      Math.min(
        0.29,
        family.lightBias + keyedRange(state.soul, `${key}:light`, -0.04, 0.04),
      ),
    );
    const baseDirection = combine(
      frame.normal,
      frame.tangent,
      forwardBias,
      lightBias,
    );
    const angleJitter = keyedRange(state.soul, `${key}:angle`, -22, 22);
    let direction = normalize(rotate(baseDirection, angleJitter));

    const sideDot = direction.x * frame.normal.x + direction.y * frame.normal.y;
    if (sideDot < 0.1) {
      direction = normalize({
        x: direction.x * 0.76 + frame.normal.x * 0.24,
        y: direction.y * 0.76 + frame.normal.y * 0.24,
      });
    }

    const length =
      family.baseLength *
      orderLengthScale(frame.order) *
      keyedRange(state.soul, `${key}:length`, 0.84, 1.16);
    const width =
      length *
      family.widthRatio *
      keyedRange(state.soul, `${key}:width`, 0.9, 1.1);
    const petioleLength =
      family.petioleScale *
      orderPetioleScale(frame.order) *
      keyedRange(state.soul, `${key}:petiole`, 0.85, 1.15);
    const asymmetry = keyedRange(state.soul, `${key}:asymmetry`, -0.1, 0.1);
    const leftWidth = width * (1 + asymmetry);
    const rightWidth = width * (1 - asymmetry);

    const stemOrigin = frame.surface;
    const base = offset(stemOrigin, direction, petioleLength);
    const tip = offset(base, direction, length);
    const perpendicular = { x: -direction.y, y: direction.x };
    const lower = 0.2 + (1 - family.tipTension) * 0.05;
    const widest = 0.53 + family.tipTension * 0.06;

    const leftControl1 = {
      x: base.x + direction.x * length * lower + perpendicular.x * leftWidth * 0.5,
      y: base.y + direction.y * length * lower + perpendicular.y * leftWidth * 0.5,
    };
    const leftControl2 = {
      x: base.x + direction.x * length * widest + perpendicular.x * leftWidth,
      y: base.y + direction.y * length * widest + perpendicular.y * leftWidth,
    };
    const rightControl2 = {
      x: base.x + direction.x * length * widest - perpendicular.x * rightWidth,
      y: base.y + direction.y * length * widest - perpendicular.y * rightWidth,
    };
    const rightControl1 = {
      x: base.x + direction.x * length * lower - perpendicular.x * rightWidth * 0.5,
      y: base.y + direction.y * length * lower - perpendicular.y * rightWidth * 0.5,
    };

    return {
      entryId: frame.entryId,
      moduleId: frame.moduleId,
      status: frame.status,
      bornAtEvent: frame.bornAtEvent,
      order: frame.order,
      side: frame.side,
      position: frame.position,
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
