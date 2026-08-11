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
  const projectionState: TreeState = {
    ...state,
    leaves: state.leaves.filter((leaf) => entryIds.has(leaf.entryId)),
  };
  return new Map(
    projectLeafForms(projectionState).map((form) => [form.entryId, form]),
  );
}

function mediumScale(count: number): { length: number; width: number } {
  const density = Math.log2(Math.max(1, count) + 1);
  return {
    length: 1.08 + Math.min(0.72, density * 0.12),
    width: 1.16 + Math.min(0.92, density * 0.15),
  };
}

function farScale(count: number): { length: number; widthFromLength: number } {
  const density = Math.log2(Math.max(1, count) + 1);
  return {
    // Far buckets represent a local canopy mass, not one giant leaf. Keep the
    // long axis compact and let width approach it as membership grows.
    length: 1.45 + Math.min(1.05, density * 0.15),
    widthFromLength: 0.72 + Math.min(0.55, density * 0.11),
  };
}

function centerFor(form: ProjectedLeafForm, level: ClusterDetailLevel): Point {
  const distance = form.length * (level === "module" ? 0.58 : 0.64);
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

    const count = bucket.memberEntryIds.length;
    const medium = level === "module" ? mediumScale(count) : null;
    const far = level === "axis" ? farScale(count) : null;
    const length = medium
      ? form.length * medium.length
      : form.length * (far?.length ?? 1);
    const width = medium
      ? Math.max(form.width, form.length * 0.2) * medium.width
      : form.length * (far?.widthFromLength ?? 0.8);

    return {
      level,
      key: bucket.key,
      representativeEntryId: bucket.representativeEntryId,
      memberEntryIds: [...bucket.memberEntryIds],
      memberCount: count,
      center: centerFor(form, level),
      direction: form.direction,
      length,
      width,
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
