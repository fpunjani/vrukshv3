import { projectTree } from "./geometry";
import type {
  Point3D,
  ProjectedSpatialSegment,
  TreeState,
} from "./types";

/**
 * Phase-J projection adapter.
 *
 * Depth deltas are supplied externally so Phase A can prove spatial geometry
 * without changing TreeState or historical growth. Phase B will replace this
 * adapter input with the persisted module restDepth field if the architecture
 * earns that schema change.
 */
export function projectTreeSpatial(
  state: TreeState,
  depthDeltaByModule?: ReadonlyMap<string, number>,
): ProjectedSpatialSegment[] {
  const planar = projectTree(state);
  const spatialById = new Map<string, ProjectedSpatialSegment>();
  const moduleById = new Map(state.modules.map((module) => [module.id, module]));
  const result: ProjectedSpatialSegment[] = [];

  for (const segment of planar) {
    const parent = segment.parentId ? spatialById.get(segment.parentId) : undefined;
    if (segment.parentId && !parent) {
      throw new Error(
        `Projected spatial segment ${segment.id} references missing parent ${segment.parentId}`,
      );
    }

    const startDepth = parent?.endDepth ?? 0;
    const module = moduleById.get(segment.id);
    if (!module) {
      throw new Error(`Spatial segment ${segment.id} has no growth module`);
    }
    const delta = depthDeltaByModule?.get(segment.id) ?? module.restDepth;
    if (!Number.isFinite(delta)) {
      throw new Error(`Non-finite depth delta for module ${segment.id}`);
    }

    const spatial: ProjectedSpatialSegment = {
      ...segment,
      startDepth,
      endDepth: startDepth + delta,
    };
    spatialById.set(spatial.id, spatial);
    result.push(spatial);
  }

  return result;
}

export function spatialStart(segment: ProjectedSpatialSegment): Point3D {
  return {
    x: segment.start.x,
    y: segment.start.y,
    z: segment.startDepth,
  };
}

export function spatialEnd(segment: ProjectedSpatialSegment): Point3D {
  return {
    x: segment.end.x,
    y: segment.end.y,
    z: segment.endDepth,
  };
}
