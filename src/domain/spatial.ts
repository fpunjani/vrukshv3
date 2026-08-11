import type { Point, Point3D } from "./types";

export function pointFrom(start: Point, heading: number, length: number): Point {
  const radians = (heading * Math.PI) / 180;
  return {
    x: start.x + Math.sin(radians) * length,
    y: start.y - Math.cos(radians) * length,
  };
}

export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function orientation(a: Point, b: Point, c: Point): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

export function properIntersection(a: Point, b: Point, c: Point, d: Point): boolean {
  const epsilon = 1e-9;
  const o1 = orientation(a, b, c);
  const o2 = orientation(a, b, d);
  const o3 = orientation(c, d, a);
  const o4 = orientation(c, d, b);
  return (
    ((o1 > epsilon && o2 < -epsilon) || (o1 < -epsilon && o2 > epsilon)) &&
    ((o3 > epsilon && o4 < -epsilon) || (o3 < -epsilon && o4 > epsilon))
  );
}

export function pointToSegmentDistance(point: Point, start: Point, end: Point): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(point.x - start.x, point.y - start.y);

  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - start.x) * dx + (point.y - start.y) * dy) /
        lengthSquared,
    ),
  );
  const closestX = start.x + t * dx;
  const closestY = start.y + t * dy;
  return Math.hypot(point.x - closestX, point.y - closestY);
}

export function segmentToSegmentDistance(
  aStart: Point,
  aEnd: Point,
  bStart: Point,
  bEnd: Point,
): number {
  if (properIntersection(aStart, aEnd, bStart, bEnd)) return 0;
  return Math.min(
    pointToSegmentDistance(aStart, bStart, bEnd),
    pointToSegmentDistance(aEnd, bStart, bEnd),
    pointToSegmentDistance(bStart, aStart, aEnd),
    pointToSegmentDistance(bEnd, aStart, aEnd),
  );
}

function subtract3(a: Point3D, b: Point3D): Point3D {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot3(a: Point3D, b: Point3D): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function norm3(a: Point3D): number {
  return Math.hypot(a.x, a.y, a.z);
}

export function pointToSegmentDistance3D(
  point: Point3D,
  start: Point3D,
  end: Point3D,
): number {
  const segment = subtract3(end, start);
  const lengthSquared = dot3(segment, segment);
  if (lengthSquared <= 1e-15) return norm3(subtract3(point, start));

  const offset = subtract3(point, start);
  const t = Math.max(0, Math.min(1, dot3(offset, segment) / lengthSquared));
  return Math.hypot(
    point.x - (start.x + segment.x * t),
    point.y - (start.y + segment.y * t),
    point.z - (start.z + segment.z * t),
  );
}

/**
 * Minimum Euclidean distance between two closed 3D line segments.
 *
 * The implementation solves for the closest points on the two infinite lines,
 * then clamps the line parameters to the closed segment domains. Degenerate
 * point-segments and nearly parallel segments are handled explicitly.
 */
export function segmentToSegmentDistance3D(
  aStart: Point3D,
  aEnd: Point3D,
  bStart: Point3D,
  bEnd: Point3D,
): number {
  const epsilon = 1e-12;
  const u = subtract3(aEnd, aStart);
  const v = subtract3(bEnd, bStart);
  const w = subtract3(aStart, bStart);
  const a = dot3(u, u);
  const b = dot3(u, v);
  const c = dot3(v, v);
  const d = dot3(u, w);
  const e = dot3(v, w);

  if (a <= epsilon && c <= epsilon) {
    return norm3(subtract3(aStart, bStart));
  }
  if (a <= epsilon) return pointToSegmentDistance3D(aStart, bStart, bEnd);
  if (c <= epsilon) return pointToSegmentDistance3D(bStart, aStart, aEnd);

  const denominator = a * c - b * b;
  let sNumerator: number;
  let sDenominator = denominator;
  let tNumerator: number;
  let tDenominator = denominator;

  if (denominator <= epsilon) {
    // Almost parallel: pin A to its start and solve the nearest point on B.
    sNumerator = 0;
    sDenominator = 1;
    tNumerator = e;
    tDenominator = c;
  } else {
    sNumerator = b * e - c * d;
    tNumerator = a * e - b * d;

    if (sNumerator < 0) {
      sNumerator = 0;
      tNumerator = e;
      tDenominator = c;
    } else if (sNumerator > sDenominator) {
      sNumerator = sDenominator;
      tNumerator = e + b;
      tDenominator = c;
    }
  }

  if (tNumerator < 0) {
    tNumerator = 0;
    if (-d < 0) {
      sNumerator = 0;
    } else if (-d > a) {
      sNumerator = sDenominator;
    } else {
      sNumerator = -d;
      sDenominator = a;
    }
  } else if (tNumerator > tDenominator) {
    tNumerator = tDenominator;
    const projected = -d + b;
    if (projected < 0) {
      sNumerator = 0;
    } else if (projected > a) {
      sNumerator = sDenominator;
    } else {
      sNumerator = projected;
      sDenominator = a;
    }
  }

  const s = Math.abs(sNumerator) <= epsilon ? 0 : sNumerator / sDenominator;
  const t = Math.abs(tNumerator) <= epsilon ? 0 : tNumerator / tDenominator;
  return Math.hypot(
    w.x + s * u.x - t * v.x,
    w.y + s * u.y - t * v.y,
    w.z + s * u.z - t * v.z,
  );
}
