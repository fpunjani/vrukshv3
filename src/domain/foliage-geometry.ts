import { projectTreeCurves, type ProjectedCurve } from "./geometry";
import type { EntryStatus, Point, TreeState } from "./types";

export interface ProjectedFoliageFrame {
  entryId: string;
  moduleId: string;
  status: EntryStatus;
  bornAtEvent: number;
  position: number;
  side: -1 | 1;
  order: number;
  anchor: Point;
  surface: Point;
  tangent: Point;
  normal: Point;
  thickness: number;
}

export interface ProjectedFoliageMark {
  entryId: string;
  moduleId: string;
  status: EntryStatus;
  bornAtEvent: number;
  position: number;
  side: -1 | 1;
  anchor: Point;
  point: Point;
}

function cubicPoint(curve: ProjectedCurve, t: number): Point {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  return {
    x:
      mt2 * mt * curve.start.x +
      3 * mt2 * t * curve.control1.x +
      3 * mt * t2 * curve.control2.x +
      t2 * t * curve.end.x,
    y:
      mt2 * mt * curve.start.y +
      3 * mt2 * t * curve.control1.y +
      3 * mt * t2 * curve.control2.y +
      t2 * t * curve.end.y,
  };
}

function cubicDerivative(curve: ProjectedCurve, t: number): Point {
  const mt = 1 - t;
  return {
    x:
      3 * mt * mt * (curve.control1.x - curve.start.x) +
      6 * mt * t * (curve.control2.x - curve.control1.x) +
      3 * t * t * (curve.end.x - curve.control2.x),
    y:
      3 * mt * mt * (curve.control1.y - curve.start.y) +
      6 * mt * t * (curve.control2.y - curve.control1.y) +
      3 * t * t * (curve.end.y - curve.control2.y),
  };
}

export function projectFoliageFrames(state: TreeState): ProjectedFoliageFrame[] {
  const curveById = new Map(
    projectTreeCurves(state).map((curve) => [curve.id, curve]),
  );
  const result: ProjectedFoliageFrame[] = [];

  for (const leaf of state.leaves) {
    const curve = curveById.get(leaf.attachment.moduleId);
    if (!curve) continue;

    const t = Math.max(0, Math.min(1, leaf.attachment.position));
    const anchor = cubicPoint(curve, t);
    const derivative = cubicDerivative(curve, t);
    const magnitude = Math.max(1e-9, Math.hypot(derivative.x, derivative.y));
    const tangent = {
      x: derivative.x / magnitude,
      y: derivative.y / magnitude,
    };
    const leftNormal = {
      x: -tangent.y,
      y: tangent.x,
    };
    const normal = {
      x: leftNormal.x * leaf.attachment.side,
      y: leftNormal.y * leaf.attachment.side,
    };
    const thickness =
      curve.startThickness +
      (curve.endThickness - curve.startThickness) * t;
    const surfaceOffset = thickness / 2 + 0.12;

    result.push({
      entryId: leaf.entryId,
      moduleId: leaf.attachment.moduleId,
      status: leaf.status,
      bornAtEvent: leaf.bornAtEvent,
      position: leaf.attachment.position,
      side: leaf.attachment.side,
      order: curve.order,
      anchor,
      surface: {
        x: anchor.x + normal.x * surfaceOffset,
        y: anchor.y + normal.y * surfaceOffset,
      },
      tangent,
      normal,
      thickness,
    });
  }

  return result;
}

export function projectFoliageMarks(state: TreeState): ProjectedFoliageMark[] {
  return projectFoliageFrames(state).map((frame) => {
    const offset = frame.thickness / 2 + 1.35;
    return {
      entryId: frame.entryId,
      moduleId: frame.moduleId,
      status: frame.status,
      bornAtEvent: frame.bornAtEvent,
      position: frame.position,
      side: frame.side,
      anchor: frame.anchor,
      point: {
        x: frame.anchor.x + frame.normal.x * offset,
        y: frame.anchor.y + frame.normal.y * offset,
      },
    };
  });
}
