import { projectTree } from "./geometry";
import { diagnoseMorphology } from "./morphology";
import type { GrowthModule, TreeState } from "./types";

const TERMINAL_ORDER = 4;

export interface MatureFrontierDiagnostics {
  horizon: number;
  totalModules: number;
  postHorizonModules: number;
  postHorizonContinuations: number;
  postHorizonLaterals: number;
  postHorizonOrderCounts: number[];
  newOrder1Axes: number;
  legacyWoodLateralActivations: number;
  legacyWoodLateralFraction: number;
  medianParentStructuralAge: number;
  p90ParentStructuralAge: number;
  maxParentStructuralAge: number;
  medianLateralParentStructuralAge: number;
  p90LateralParentStructuralAge: number;
  maxLateralParentStructuralAge: number;
  lateralParentOver50Fraction: number;
  lateralParentOver100Fraction: number;
  lateralParentOver200Fraction: number;
  medianContinuationDormancyGap: number;
  p90ContinuationDormancyGap: number;
  maxContinuationDormancyGap: number;
  continuationDormancyOver50Fraction: number;
  continuationDormancyOver100Fraction: number;
  postHorizonVerticalFraction: number;
  postHorizonVerticalFractionByOrder: number[];
  recentVerticalFraction: number;
  recentVerticalFractionByOrder: number[];
  terminalAxisCount: number;
  medianTerminalAxisModules: number;
  p90TerminalAxisModules: number;
  maxTerminalAxisModules: number;
  terminalAxisOver3Fraction: number;
  terminalAxisOver5Fraction: number;
  terminalAxisOver8Fraction: number;
  medianTerminalAxisLength: number;
  p90TerminalAxisLength: number;
  maxTerminalAxisLength: number;
  postHorizonTerminalModuleFraction: number;
  legacyScaffoldModuleShare: number;
  crownWidth: number;
  crownHeight: number;
  crownAspect: number;
}

function percentile(values: readonly number[], fraction: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(sorted.length * fraction) - 1),
  );
  return sorted[index];
}

function fractionOver(values: readonly number[], threshold: number): number {
  if (values.length === 0) return 0;
  return values.filter((value) => value > threshold).length / values.length;
}

function normalizedHeading(heading: number): number {
  return ((heading + 180) % 360 + 360) % 360 - 180;
}

function verticalFraction(
  modules: readonly GrowthModule[],
  headingById: ReadonlyMap<string, number>,
): number {
  if (modules.length === 0) return 0;
  const vertical = modules.filter((module) => {
    const heading = headingById.get(module.id);
    return heading !== undefined && Math.abs(normalizedHeading(heading)) <= 20;
  }).length;
  return vertical / modules.length;
}

function verticalFractionByOrder(
  modules: readonly GrowthModule[],
  headingById: ReadonlyMap<string, number>,
  maxOrder: number,
): number[] {
  return Array.from({ length: maxOrder + 1 }, (_, order) =>
    verticalFraction(
      modules.filter((module) => module.order === order),
      headingById,
    ),
  );
}

function order1RootAxis(
  module: GrowthModule,
  moduleById: ReadonlyMap<string, GrowthModule>,
): string | null {
  let current: GrowthModule | undefined = module;
  while (current && current.order > 1 && current.parentId) {
    current = moduleById.get(current.parentId);
  }
  return current?.order === 1 ? current.axisId : null;
}

export function diagnoseMatureFrontier(
  state: TreeState,
  horizon = 1000,
): MatureFrontierDiagnostics {
  const moduleById = new Map(state.modules.map((module) => [module.id, module]));
  const ordinalById = new Map(
    state.modules.map((module, index) => [module.id, index]),
  );
  const projected = projectTree(state);
  const projectedById = new Map(
    projected.map((segment) => [segment.id, segment]),
  );
  const headingById = new Map(
    projected.map((segment) => [segment.id, segment.heading]),
  );

  const postHorizon = state.modules.filter(
    (module) => module.bornAtEvent > horizon,
  );
  const postContinuations = postHorizon.filter(
    (module) => module.relation === "continuation",
  );
  const postLaterals = postHorizon.filter(
    (module) => module.relation === "lateral",
  );

  const maxOrder = state.modules.reduce(
    (max, module) => Math.max(max, module.order),
    0,
  );
  const postHorizonOrderCounts = Array.from(
    { length: maxOrder + 1 },
    () => 0,
  );
  for (const module of postHorizon) {
    postHorizonOrderCounts[module.order] += 1;
  }

  const parentStructuralAges: number[] = [];
  const lateralParentStructuralAges: number[] = [];
  let legacyWoodLateralActivations = 0;

  for (const module of postHorizon) {
    if (!module.parentId) continue;
    const parent = moduleById.get(module.parentId);
    const moduleOrdinal = ordinalById.get(module.id);
    const parentOrdinal = ordinalById.get(module.parentId);
    if (
      !parent ||
      moduleOrdinal === undefined ||
      parentOrdinal === undefined
    ) {
      continue;
    }

    const structuralAge = moduleOrdinal - parentOrdinal;
    parentStructuralAges.push(structuralAge);
    if (module.relation === "lateral") {
      lateralParentStructuralAges.push(structuralAge);
      if (parent.bornAtEvent <= horizon) legacyWoodLateralActivations += 1;
    }
  }

  const continuationDormancyGaps: number[] = [];
  const latestOrdinalByAxis = new Map<string, number>();
  for (let index = 0; index < state.modules.length; index += 1) {
    const module = state.modules[index];
    const previousOrdinal = latestOrdinalByAxis.get(module.axisId);
    if (
      module.bornAtEvent > horizon &&
      module.relation === "continuation" &&
      previousOrdinal !== undefined
    ) {
      continuationDormancyGaps.push(index - previousOrdinal);
    }
    latestOrdinalByAxis.set(module.axisId, index);
  }

  const terminalAxisModuleCounts = new Map<string, number>();
  const terminalAxisLengths = new Map<string, number>();
  for (const module of state.modules) {
    if (module.order !== TERMINAL_ORDER) continue;
    terminalAxisModuleCounts.set(
      module.axisId,
      (terminalAxisModuleCounts.get(module.axisId) ?? 0) + 1,
    );
    const segment = projectedById.get(module.id);
    if (segment) {
      terminalAxisLengths.set(
        module.axisId,
        (terminalAxisLengths.get(module.axisId) ?? 0) + segment.length,
      );
    }
  }
  const terminalModuleCounts = [...terminalAxisModuleCounts.values()];
  const terminalLengths = [...terminalAxisLengths.values()];
  const postHorizonTerminalModules = postHorizon.filter(
    (module) => module.order === TERMINAL_ORDER,
  ).length;

  const order1Roots = state.modules.filter(
    (module) => module.order === 1 && module.relation === "lateral",
  );
  const legacyOrder1Axes = new Set(
    order1Roots
      .filter((module) => module.bornAtEvent <= horizon)
      .map((module) => module.axisId),
  );
  const newOrder1Axes = order1Roots.filter(
    (module) => module.bornAtEvent > horizon,
  ).length;

  const nonTrunkModules = state.modules.filter((module) => module.order > 0);
  const modulesInLegacyScaffolds = nonTrunkModules.filter((module) => {
    const rootAxis = order1RootAxis(module, moduleById);
    return rootAxis !== null && legacyOrder1Axes.has(rootAxis);
  }).length;

  const recentStart = Math.max(horizon, Math.floor(state.growthIndex * 0.8));
  const recentModules = state.modules.filter(
    (module) => module.bornAtEvent > recentStart,
  );
  const morphology = diagnoseMorphology(state);

  return {
    horizon,
    totalModules: state.modules.length,
    postHorizonModules: postHorizon.length,
    postHorizonContinuations: postContinuations.length,
    postHorizonLaterals: postLaterals.length,
    postHorizonOrderCounts,
    newOrder1Axes,
    legacyWoodLateralActivations,
    legacyWoodLateralFraction:
      postLaterals.length > 0
        ? legacyWoodLateralActivations / postLaterals.length
        : 0,
    medianParentStructuralAge: percentile(parentStructuralAges, 0.5),
    p90ParentStructuralAge: percentile(parentStructuralAges, 0.9),
    maxParentStructuralAge: Math.max(0, ...parentStructuralAges),
    medianLateralParentStructuralAge: percentile(
      lateralParentStructuralAges,
      0.5,
    ),
    p90LateralParentStructuralAge: percentile(
      lateralParentStructuralAges,
      0.9,
    ),
    maxLateralParentStructuralAge: Math.max(0, ...lateralParentStructuralAges),
    lateralParentOver50Fraction: fractionOver(lateralParentStructuralAges, 50),
    lateralParentOver100Fraction: fractionOver(lateralParentStructuralAges, 100),
    lateralParentOver200Fraction: fractionOver(lateralParentStructuralAges, 200),
    medianContinuationDormancyGap: percentile(continuationDormancyGaps, 0.5),
    p90ContinuationDormancyGap: percentile(continuationDormancyGaps, 0.9),
    maxContinuationDormancyGap: Math.max(0, ...continuationDormancyGaps),
    continuationDormancyOver50Fraction: fractionOver(
      continuationDormancyGaps,
      50,
    ),
    continuationDormancyOver100Fraction: fractionOver(
      continuationDormancyGaps,
      100,
    ),
    postHorizonVerticalFraction: verticalFraction(postHorizon, headingById),
    postHorizonVerticalFractionByOrder: verticalFractionByOrder(
      postHorizon,
      headingById,
      maxOrder,
    ),
    recentVerticalFraction: verticalFraction(recentModules, headingById),
    recentVerticalFractionByOrder: verticalFractionByOrder(
      recentModules,
      headingById,
      maxOrder,
    ),
    terminalAxisCount: terminalModuleCounts.length,
    medianTerminalAxisModules: percentile(terminalModuleCounts, 0.5),
    p90TerminalAxisModules: percentile(terminalModuleCounts, 0.9),
    maxTerminalAxisModules: Math.max(0, ...terminalModuleCounts),
    terminalAxisOver3Fraction: fractionOver(terminalModuleCounts, 3),
    terminalAxisOver5Fraction: fractionOver(terminalModuleCounts, 5),
    terminalAxisOver8Fraction: fractionOver(terminalModuleCounts, 8),
    medianTerminalAxisLength: percentile(terminalLengths, 0.5),
    p90TerminalAxisLength: percentile(terminalLengths, 0.9),
    maxTerminalAxisLength: Math.max(0, ...terminalLengths),
    postHorizonTerminalModuleFraction:
      postHorizon.length > 0
        ? postHorizonTerminalModules / postHorizon.length
        : 0,
    legacyScaffoldModuleShare:
      nonTrunkModules.length > 0
        ? modulesInLegacyScaffolds / nonTrunkModules.length
        : 0,
    crownWidth: morphology.totalWidth,
    crownHeight: morphology.totalHeight,
    crownAspect:
      morphology.totalHeight > 0
        ? morphology.totalWidth / morphology.totalHeight
        : 0,
  };
}
