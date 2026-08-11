import { projectFoliageFrames } from "./foliage-geometry";
import { keyedRange } from "./random";
import type { EntryStatus, Point, TreeState } from "./types";

const GOLDEN_ANGLE_DEGREES = 137.50776405003785;

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
  faceExposure: number;
  depth: number;
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
  faceExposure: number,
): Point {
  const tangentWeight = Math.max(0.38, Math.min(0.78, forwardBias));
  const normalWeight =
    (1 - tangentWeight) * (0.32 + Math.max(0, Math.min(1, faceExposure)) * 0.68);
  return normalize({
    x: normal.x * normalWeight + tangent.x * tangentWeight,
    y: normal.y * normalWeight + tangent.y * tangentWeight - lightBias,
  });
}

function attachmentProgress(position: number): number {
  return Math.max(0, Math.min(1, (position - 0.18) / (0.92 - 0.18)));
}

function phyllotacticProjection(
  soul: string,
  moduleId: string,
  bornAtEvent: number,
): { faceExposure: number; depth: number } {
  // Birth chronology gives each identity a stable phase that can never be
  // renumbered by future leaves. The module-specific offset prevents every
  // branch from sharing the same projection pattern.
  const modulePhase = keyedRange(
    soul,
    `leaf-family:${moduleId}:phase`,
    0,
    180,
  );
  const wrapped =
    ((modulePhase + bornAtEvent * GOLDEN_ANGLE_DEGREES) % 180 + 180) % 180;
  const halfPlaneAngle = wrapped - 90;
  const radians = (halfPlaneAngle * Math.PI) / 180;
  return {
    faceExposure: Math.max(0.18, Math.cos(radians)),
    depth: Math.sin(radians),
  };
}

function orderLengthScale(order: number): number {
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
    const progress = attachmentProgress(frame.position);
    const { faceExposure, depth } = phyllotacticProjection(
      state.soul,
      frame.moduleId,
      frame.bornAtEvent,
    );

    // Basal leaves bear more laterally; distal leaves sweep forward along the
    // supporting wood. The 2.5D exposure then modulates how strongly that side
    // normal survives projection onto the screen.
    const positionalSweep = (progress - 0.5) * 0.26;
    const forwardBias = Math.max(
      0.36,
      Math.min(
        0.8,
        family.forwardBias +
          positionalSweep +
          keyedRange(state.soul, `${key}:forward`, -0.03, 0.03),
      ),
    );
    const lightBias = Math.max(
      0.03,
      Math.min(
        0.29,
        family.lightBias + keyedRange(state.soul, `${key}:light`, -0.03, 0.03),
      ),
    );
    const baseDirection = combine(
      frame.normal,
      frame.tangent,
      forwardBias,
      lightBias,
      faceExposure,
    );
    const angleJitter = keyedRange(state.soul, `${key}:angle`, -8, 8);
    let direction = normalize(rotate(baseDirection, angleJitter));

    const sideDot = direction.x * frame.normal.x + direction.y * frame.normal.y;
    if (sideDot < 0.035) {
      direction = normalize({
        x: direction.x * 0.8 + frame.normal.x * 0.2,
        y: direction.y * 0.8 + frame.normal.y * 0.2,
      });
    }

    const positionalScale = 0.94 + Math.sin(progress * Math.PI) * 0.1;
    const depthLengthScale = 0.84 + faceExposure * 0.16;
    const length =
      family.baseLength *
      orderLengthScale(frame.order) *
      positionalScale *
      depthLengthScale *
      keyedRange(state.soul, `${key}:length`, 0.87, 1.13);
    const faceWidthScale = 0.36 + faceExposure * 0.64;
    const width =
      length *
      family.widthRatio *
      faceWidthScale *
      keyedRange(state.soul, `${key}:width`, 0.92, 1.08);
    const petioleLength =
      family.petioleScale *
      orderPetioleScale(frame.order) *
      (0.72 + faceExposure * 0.28) *
      keyedRange(state.soul, `${key}:petiole`, 0.88, 1.12);
    const asymmetry = keyedRange(state.soul, `${key}:asymmetry`, -0.09, 0.09);
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
      faceExposure,
      depth,
    };
  });
}
