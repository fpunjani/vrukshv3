import {
  projectCanopyRepresentation,
  type AxisCanopyBucket,
  type ModuleCanopyBucket,
} from "./canopy-lod";
import { projectLeafForms, type ProjectedLeafForm } from "./leaf-form";
import type { Point, TreeState } from "./types";

export type ClusterDetailLevel = "module" | "axis";

export interface ProjectedCanopyCluster {
  level: ClusterDetailLevel;
  key: string;
  representativeEntryId: string;
  memberEntryIds: string[];
  memberCount: number;
  center: Point;
  direction: Point;
  length: number;
  width: number;
  depth: number;
  hostModuleId: string;
}

function representativeForms(
  state: TreeState,
  entryIds: ReadonlySet<string>,
): Map<string, ProjectedLeafForm> {
  // Leaf Form V1 is intrinsic to one identity + current wood; it does not read
  // sibling foliage. Project only the representatives needed at this LOD.
  const projectionState: TreeState = {
    ...state,
    leaves: state.leaves.filter((leaf) => entryIds.has(leaf.entryId)),
  };
  return new Map(
    projectLeafForms(projectionState).map((form) => [form.entryId, form]),
  );
}

function clusterScale(level: ClusterDetailLevel, count: number): {
  length: number;
  width: number;
} {
  const density = Math.log2(Math.max(1, count) + 1);
  if (level === "module") {
    return {
      length: 1.08 + Math.min(0.72, density * 0.12),
      width: 1.16 + Math.min(0.92, density * 0.15),
    };
  }
  return {
    length: 1.55 + Math.min(1.45, density * 0.2),
    width: 1.8 + Math.min(2.1, density * 0.28),
  };
}

function centerFor(form: ProjectedLeafForm, level: ClusterDetailLevel): Point {
  const distance = form.length * (level === "module" ? 0.58 : 0.72);
  return {
    x: form.base.x + form.direction.x * distance,
    y: form.base.y + form.direction.y * distance,
  };
}

export function projectCanopyClusters(
  state: TreeState,
  level: ClusterDetailLevel,
): ProjectedCanopyCluster[] {
  const representation = projectCanopyRepresentation(state, level);
  const representativeIds = new Set(
    representation.buckets.map((bucket) => bucket.representativeEntryId),
  );
  const forms = representativeForms(state, representativeIds);

  return representation.buckets.map((bucket) => {
    const form = forms.get(bucket.representativeEntryId);
    if (!form) {
      throw new Error(
        `Cannot project canopy cluster ${bucket.key}: representative ${bucket.representativeEntryId} has no Leaf Form V1 geometry`,
      );
    }
    const scale = clusterScale(level, bucket.memberEntryIds.length);
    return {
      level,
      key: bucket.key,
      representativeEntryId: bucket.representativeEntryId,
      memberEntryIds: [...bucket.memberEntryIds],
      memberCount: bucket.memberEntryIds.length,
      center: centerFor(form, level),
      direction: form.direction,
      length: form.length * scale.length,
      width: Math.max(form.width, form.length * 0.2) * scale.width,
      depth: form.depth,
      hostModuleId: form.moduleId,
    };
  });
}

export function bucketHostModuleId(
  bucket: ModuleCanopyBucket | AxisCanopyBucket,
  state: TreeState,
): string {
  if (bucket.level === "module") return bucket.moduleId;
  const representative = state.leaves.find(
    (leaf) => leaf.entryId === bucket.representativeEntryId,
  );
  if (!representative) {
    throw new Error(`Missing representative ${bucket.representativeEntryId}`);
  }
  return representative.attachment.moduleId;
}
