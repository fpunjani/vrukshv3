import type {
  GrowthModule,
  LeafIdentity,
  LeafSide,
  TreeState,
} from "./types";

export type CanopyDetailLevel = "individual" | "module" | "axis";

export interface IndividualCanopyBucket {
  level: "individual";
  key: string;
  memberEntryIds: [string];
  representativeEntryId: string;
}

export interface ModuleCanopyBucket {
  level: "module";
  key: string;
  moduleId: string;
  side: LeafSide;
  positionBin: number;
  memberEntryIds: string[];
  representativeEntryId: string;
}

export interface AxisCanopyBucket {
  level: "axis";
  key: string;
  axisId: string;
  side: LeafSide;
  moduleBand: number;
  memberEntryIds: string[];
  representativeEntryId: string;
}

export type CanopyBucket =
  | IndividualCanopyBucket
  | ModuleCanopyBucket
  | AxisCanopyBucket;

export interface CanopyRepresentation {
  level: CanopyDetailLevel;
  buckets: CanopyBucket[];
}

const ATTACHMENT_MIN = 0.18;
const ATTACHMENT_MAX = 0.92;
const MODULE_POSITION_BINS = 4;
const AXIS_MODULE_BAND_SIZE = 4;

interface ModuleTopology {
  module: GrowthModule;
  axisOrdinal: number;
}

function stableLeafOrder(a: LeafIdentity, b: LeafIdentity): number {
  return a.bornAtEvent - b.bornAtEvent || a.entryId.localeCompare(b.entryId);
}

function positionBin(position: number): number {
  const normalized = Math.max(
    0,
    Math.min(1, (position - ATTACHMENT_MIN) / (ATTACHMENT_MAX - ATTACHMENT_MIN)),
  );
  return Math.min(
    MODULE_POSITION_BINS - 1,
    Math.floor(normalized * MODULE_POSITION_BINS),
  );
}

function moduleTopology(state: TreeState): Map<string, ModuleTopology> {
  const byAxis = new Map<string, GrowthModule[]>();
  for (const module of state.modules) {
    const list = byAxis.get(module.axisId) ?? [];
    list.push(module);
    byAxis.set(module.axisId, list);
  }

  const result = new Map<string, ModuleTopology>();
  for (const modules of byAxis.values()) {
    const ordered = [...modules].sort(
      (a, b) => a.bornAtEvent - b.bornAtEvent || a.id.localeCompare(b.id),
    );
    ordered.forEach((module, axisOrdinal) => {
      result.set(module.id, { module, axisOrdinal });
    });
  }
  return result;
}

export function individualBucketKey(entryId: string): string {
  return `leaf:${entryId}`;
}

export function moduleBucketKey(leaf: LeafIdentity): string {
  return [
    "module",
    leaf.attachment.moduleId,
    `side:${leaf.attachment.side}`,
    `position:${positionBin(leaf.attachment.position)}`,
  ].join("|");
}

export function axisBucketKey(
  leaf: LeafIdentity,
  topology: ReadonlyMap<string, ModuleTopology>,
): string {
  const host = topology.get(leaf.attachment.moduleId);
  if (!host) {
    throw new Error(
      `Cannot derive axis LOD bucket: missing host ${leaf.attachment.moduleId}`,
    );
  }
  const band = Math.floor(host.axisOrdinal / AXIS_MODULE_BAND_SIZE);
  return [
    "axis",
    host.module.axisId,
    `side:${leaf.attachment.side}`,
    `band:${band}`,
  ].join("|");
}

function groupLeaves(
  leaves: readonly LeafIdentity[],
  keyFor: (leaf: LeafIdentity) => string,
): Map<string, LeafIdentity[]> {
  const groups = new Map<string, LeafIdentity[]>();
  for (const leaf of leaves) {
    const key = keyFor(leaf);
    const list = groups.get(key) ?? [];
    list.push(leaf);
    groups.set(key, list);
  }
  for (const group of groups.values()) group.sort(stableLeafOrder);
  return groups;
}

function individualRepresentation(state: TreeState): CanopyRepresentation {
  const leaves = [...state.leaves].sort(stableLeafOrder);
  return {
    level: "individual",
    buckets: leaves.map((leaf) => ({
      level: "individual" as const,
      key: individualBucketKey(leaf.entryId),
      memberEntryIds: [leaf.entryId],
      representativeEntryId: leaf.entryId,
    })),
  };
}

function moduleRepresentation(state: TreeState): CanopyRepresentation {
  const groups = groupLeaves(state.leaves, moduleBucketKey);
  const leavesById = new Map(state.leaves.map((leaf) => [leaf.entryId, leaf]));
  const buckets: ModuleCanopyBucket[] = [];

  for (const [key, members] of [...groups.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const first = members[0];
    const resolved = leavesById.get(first.entryId);
    if (!resolved) continue;
    buckets.push({
      level: "module",
      key,
      moduleId: resolved.attachment.moduleId,
      side: resolved.attachment.side,
      positionBin: positionBin(resolved.attachment.position),
      memberEntryIds: members.map((leaf) => leaf.entryId),
      representativeEntryId: first.entryId,
    });
  }

  return { level: "module", buckets };
}

function axisRepresentation(state: TreeState): CanopyRepresentation {
  const topology = moduleTopology(state);
  const groups = groupLeaves(state.leaves, (leaf) => axisBucketKey(leaf, topology));
  const buckets: AxisCanopyBucket[] = [];

  for (const [key, members] of [...groups.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const first = members[0];
    const host = topology.get(first.attachment.moduleId);
    if (!host) continue;
    buckets.push({
      level: "axis",
      key,
      axisId: host.module.axisId,
      side: first.attachment.side,
      moduleBand: Math.floor(host.axisOrdinal / AXIS_MODULE_BAND_SIZE),
      memberEntryIds: members.map((leaf) => leaf.entryId),
      representativeEntryId: first.entryId,
    });
  }

  return { level: "axis", buckets };
}

export function projectCanopyRepresentation(
  state: TreeState,
  level: CanopyDetailLevel,
): CanopyRepresentation {
  if (level === "individual") return individualRepresentation(state);
  if (level === "module") return moduleRepresentation(state);
  return axisRepresentation(state);
}

export function entryBucketMap(
  representation: CanopyRepresentation,
): Map<string, string> {
  const result = new Map<string, string>();
  for (const bucket of representation.buckets) {
    for (const entryId of bucket.memberEntryIds) {
      if (result.has(entryId)) {
        throw new Error(
          `Entry ${entryId} appears in more than one ${representation.level} bucket`,
        );
      }
      result.set(entryId, bucket.key);
    }
  }
  return result;
}

export function farBucketForModuleBucket(
  state: TreeState,
  bucket: ModuleCanopyBucket,
): string {
  const topology = moduleTopology(state);
  const representative = state.leaves.find(
    (leaf) => leaf.entryId === bucket.representativeEntryId,
  );
  if (!representative) {
    throw new Error(`Missing representative ${bucket.representativeEntryId}`);
  }
  return axisBucketKey(representative, topology);
}

export const CANOPY_LOD_POLICY = {
  modulePositionBins: MODULE_POSITION_BINS,
  axisModuleBandSize: AXIS_MODULE_BAND_SIZE,
} as const;
