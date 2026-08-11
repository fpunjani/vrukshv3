import { properIntersection, segmentToSegmentDistance3D } from "./spatial";
import {
  projectTreeSpatial,
  spatialEnd,
  spatialStart,
} from "./spatial-geometry";
import type { ProjectedSpatialSegment, TreeState } from "./types";

const STRUCTURAL_CLEARANCE = 2.0;

export interface SpatialWoodDiagnostics {
  projectedCrossings: number;
  depthSeparatedProjectedCrossings: number;
  unsafeSpatialPairs: number;
  minimumNonLocalSpatialClearance: number;
  maxAbsDepth: number;
  nonZeroDepthModules: number;
}

function isLocalJunction(
  a: ProjectedSpatialSegment,
  b: ProjectedSpatialSegment,
): boolean {
  return (
    a.parentId === b.id ||
    b.parentId === a.id ||
    (a.parentId !== null && a.parentId === b.parentId)
  );
}

export function diagnoseSpatialWood(state: TreeState): SpatialWoodDiagnostics {
  const segments = projectTreeSpatial(state);
  let projectedCrossings = 0;
  let depthSeparatedProjectedCrossings = 0;
  let unsafeSpatialPairs = 0;
  let minimumNonLocalSpatialClearance = Number.POSITIVE_INFINITY;

  for (let aIndex = 0; aIndex < segments.length; aIndex += 1) {
    const a = segments[aIndex];
    for (let bIndex = aIndex + 1; bIndex < segments.length; bIndex += 1) {
      const b = segments[bIndex];
      if (isLocalJunction(a, b)) continue;

      const projected = properIntersection(a.start, a.end, b.start, b.end);
      const clearance = segmentToSegmentDistance3D(
        spatialStart(a),
        spatialEnd(a),
        spatialStart(b),
        spatialEnd(b),
      );

      minimumNonLocalSpatialClearance = Math.min(
        minimumNonLocalSpatialClearance,
        clearance,
      );
      if (clearance < STRUCTURAL_CLEARANCE - 1e-8) unsafeSpatialPairs += 1;
      if (projected) {
        projectedCrossings += 1;
        if (clearance >= STRUCTURAL_CLEARANCE - 1e-8) {
          depthSeparatedProjectedCrossings += 1;
        }
      }
    }
  }

  let maxAbsDepth = 0;
  let nonZeroDepthModules = 0;
  for (const segment of segments) {
    maxAbsDepth = Math.max(
      maxAbsDepth,
      Math.abs(segment.startDepth),
      Math.abs(segment.endDepth),
    );
    const module = state.modules.find((candidate) => candidate.id === segment.id);
    if (module && Math.abs(module.restDepth) > 1e-9) nonZeroDepthModules += 1;
  }

  return {
    projectedCrossings,
    depthSeparatedProjectedCrossings,
    unsafeSpatialPairs,
    minimumNonLocalSpatialClearance: Number.isFinite(
      minimumNonLocalSpatialClearance,
    )
      ? minimumNonLocalSpatialClearance
      : 0,
    maxAbsDepth,
    nonZeroDepthModules,
  };
}
