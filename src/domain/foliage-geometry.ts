import { projectTreeCurves, type ProjectedCurve } from "./geometry";
import type { EntryStatus, Point, TreeState } from "./types";

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

export function projectFoliageMarks(state: TreeState): ProjectedFoliageMark[] {
  const curveById = new Map(
    projectTreeCurves(state).map((curve) => [curve.id, curve]),
  );
  const result: ProjectedFoliageMark[] = [];

  for (const leaf of state.leaves) {
    const curve = curveById.get(leaf.attachment.moduleId);
    if (!curve) continue;

    const t = Math.max(0, Math.min(1, leaf.attachment.position));
    const anchor = cubicPoint(curve, t);
    const tangent = cubicDerivative(curve, t);
    const magnitude = Math.max(1e-9, Math.hypot(tangent.x, tangent.y));
    const nx = -tangent.y / magnitude;
    const ny = tangent.x / magnitude;
    const thickness =
      curve.startThickness +
      (curve.endThickness - curve.startThickness) * t;
    const offset = thickness / 2 + 1.35;

    result.push({
      entryId: leaf.entryId,
      moduleId: leaf.attachment.moduleId,
      status: leaf.status,
      bornAtEvent: leaf.bornAtEvent,
      position: leaf.attachment.position,
      side: leaf.attachment.side,
      anchor,
      point: {
        x: anchor.x + nx * offset * leaf.attachment.side,
        y: anchor.y + ny * offset * leaf.attachment.side,
      },
    });
  }

  return result;
}
