import { projectTree } from "./geometry";
import type { GrowthModule, ProjectedSegment, TreeState } from "./types";

export interface AxisMorphology {
  axisId: string;
  order: number;
  bornAtEvent: number;
  lastGrowthEvent: number;
  moduleCount: number;
  axisLength: number;
  subtreeModuleCount: number;
  tipX: number;
  tipY: number;
}

export interface TreeMorphology {
  totalModules: number;
  trunkModules: number;
  lateralModuleFraction: number;
  axisCountByOrder: number[];
  axesWithAtLeast3ModulesByOrder: number[];
  axesWithAtLeast5ModulesByOrder: number[];
  order1AxisCount: number;
  establishedOrder1Axes: number;
  strongOrder1Axes: number;
  maxOrder1Modules: number;
  maxOrder1SubtreeModules: number;
  order1ScaffoldSpread: number;
  totalHeight: number;
  totalWidth: number;
  lowerCrownWidth: number;
  middleCrownWidth: number;
  upperCrownWidth: number;
  middleCrownAspect: number;
}

function subtreeCounts(modules: readonly GrowthModule[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const module of modules) counts.set(module.id, 1);

  for (let index = modules.length - 1; index >= 0; index -= 1) {
    const module = modules[index];
    if (!module.parentId) continue;
    counts.set(module.parentId, (counts.get(module.parentId) ?? 1) + (counts.get(module.id) ?? 1));
  }
  return counts;
}

export function summarizeAxes(state: TreeState): AxisMorphology[] {
  const projected = projectTree(state);
  const projectedById = new Map(projected.map((segment) => [segment.id, segment]));
  const subtree = subtreeCounts(state.modules);
  const byAxis = new Map<string, GrowthModule[]>();

  for (const module of state.modules) {
    const list = byAxis.get(module.axisId) ?? [];
    list.push(module);
    byAxis.set(module.axisId, list);
  }

  const result: AxisMorphology[] = [];
  for (const [axisId, modules] of byAxis) {
    const ordered = [...modules].sort((a, b) => a.bornAtEvent - b.bornAtEvent);
    const root = ordered[0];
    const tip = ordered[ordered.length - 1];
    const tipProjection = projectedById.get(tip.id);
    const axisLength = ordered.reduce(
      (sum, module) => sum + (projectedById.get(module.id)?.length ?? module.restLength),
      0,
    );

    result.push({
      axisId,
      order: root.order,
      bornAtEvent: root.bornAtEvent,
      lastGrowthEvent: tip.bornAtEvent,
      moduleCount: ordered.length,
      axisLength,
      subtreeModuleCount: subtree.get(root.id) ?? ordered.length,
      tipX: tipProjection?.end.x ?? 0,
      tipY: tipProjection?.end.y ?? 0,
    });
  }

  return result.sort(
    (a, b) => a.order - b.order || a.bornAtEvent - b.bornAtEvent || a.axisId.localeCompare(b.axisId),
  );
}

function widthInHeightBand(
  segments: readonly ProjectedSegment[],
  totalHeight: number,
  minFraction: number,
  maxFraction: number,
): number {
  if (totalHeight <= 0) return 0;
  const xs: number[] = [];
  for (const segment of segments) {
    const fraction = -segment.end.y / totalHeight;
    if (fraction >= minFraction && fraction <= maxFraction) xs.push(segment.end.x);
  }
  if (xs.length < 2) return 0;
  return Math.max(...xs) - Math.min(...xs);
}

export function diagnoseMorphology(state: TreeState): TreeMorphology {
  const segments = projectTree(state);
  const axes = summarizeAxes(state);
  const trunk = axes.find((axis) => axis.order === 0);
  const order1 = axes.filter((axis) => axis.order === 1);

  const maxOrder = axes.reduce((max, axis) => Math.max(max, axis.order), 0);
  const axisCountByOrder = Array.from({ length: maxOrder + 1 }, () => 0);
  const axesWithAtLeast3ModulesByOrder = Array.from({ length: maxOrder + 1 }, () => 0);
  const axesWithAtLeast5ModulesByOrder = Array.from({ length: maxOrder + 1 }, () => 0);
  for (const axis of axes) {
    axisCountByOrder[axis.order] += 1;
    if (axis.moduleCount >= 3) axesWithAtLeast3ModulesByOrder[axis.order] += 1;
    if (axis.moduleCount >= 5) axesWithAtLeast5ModulesByOrder[axis.order] += 1;
  }

  let minX = 0;
  let maxX = 0;
  let minY = 0;
  for (const segment of segments) {
    minX = Math.min(minX, segment.start.x, segment.end.x);
    maxX = Math.max(maxX, segment.start.x, segment.end.x);
    minY = Math.min(minY, segment.start.y, segment.end.y);
  }
  const totalHeight = -minY;
  const totalWidth = maxX - minX;
  const lowerCrownWidth = widthInHeightBand(segments, totalHeight, 0.2, 0.48);
  const middleCrownWidth = widthInHeightBand(segments, totalHeight, 0.4, 0.75);
  const upperCrownWidth = widthInHeightBand(segments, totalHeight, 0.68, 1.01);

  const establishedScaffolds = order1.filter((axis) => axis.moduleCount >= 3);
  const scaffoldXs = establishedScaffolds.map((axis) => axis.tipX);
  const order1ScaffoldSpread =
    scaffoldXs.length >= 2 ? Math.max(...scaffoldXs) - Math.min(...scaffoldXs) : 0;

  return {
    totalModules: state.modules.length,
    trunkModules: trunk?.moduleCount ?? 0,
    lateralModuleFraction:
      state.modules.length > 0
        ? state.modules.filter((module) => module.order > 0).length / state.modules.length
        : 0,
    axisCountByOrder,
    axesWithAtLeast3ModulesByOrder,
    axesWithAtLeast5ModulesByOrder,
    order1AxisCount: order1.length,
    establishedOrder1Axes: establishedScaffolds.length,
    strongOrder1Axes: order1.filter((axis) => axis.moduleCount >= 5).length,
    maxOrder1Modules: order1.reduce((max, axis) => Math.max(max, axis.moduleCount), 0),
    maxOrder1SubtreeModules: order1.reduce(
      (max, axis) => Math.max(max, axis.subtreeModuleCount),
      0,
    ),
    order1ScaffoldSpread,
    totalHeight,
    totalWidth,
    lowerCrownWidth,
    middleCrownWidth,
    upperCrownWidth,
    middleCrownAspect: totalHeight > 0 ? middleCrownWidth / totalHeight : 0,
  };
}
