import type { TreeState } from "./types";

export interface FoliageDiagnostics {
  totalLeaves: number;
  occupiedModules: number;
  occupiedModuleFraction: number;
  occupiedAxes: number;
  occupiedAxisFraction: number;
  maxModuleLoad: number;
  maxModuleLoadFraction: number;
  maxAxisLoad: number;
  maxAxisLoadFraction: number;
  trunkLeafFraction: number;
  leftRightImbalance: number;
  meanHostAgeAtAttachment: number;
}

export function diagnoseFoliage(state: TreeState): FoliageDiagnostics {
  const moduleById = new Map(state.modules.map((module) => [module.id, module]));
  const allAxes = new Set(state.modules.map((module) => module.axisId));
  const moduleLoads = new Map<string, number>();
  const axisLoads = new Map<string, number>();
  let trunkLeaves = 0;
  let left = 0;
  let right = 0;
  let totalHostAge = 0;

  for (const leaf of state.leaves) {
    const module = moduleById.get(leaf.attachment.moduleId);
    if (!module) continue;

    moduleLoads.set(module.id, (moduleLoads.get(module.id) ?? 0) + 1);
    axisLoads.set(module.axisId, (axisLoads.get(module.axisId) ?? 0) + 1);
    if (module.order === 0) trunkLeaves += 1;
    if (leaf.attachment.side < 0) left += 1;
    else right += 1;
    totalHostAge += Math.max(0, leaf.bornAtEvent - module.bornAtEvent);
  }

  const totalLeaves = state.leaves.length;
  const maxModuleLoad = Math.max(0, ...moduleLoads.values());
  const maxAxisLoad = Math.max(0, ...axisLoads.values());
  const sideCount = left + right;

  return {
    totalLeaves,
    occupiedModules: moduleLoads.size,
    occupiedModuleFraction:
      state.modules.length > 0 ? moduleLoads.size / state.modules.length : 0,
    occupiedAxes: axisLoads.size,
    occupiedAxisFraction:
      allAxes.size > 0 ? axisLoads.size / allAxes.size : 0,
    maxModuleLoad,
    maxModuleLoadFraction: totalLeaves > 0 ? maxModuleLoad / totalLeaves : 0,
    maxAxisLoad,
    maxAxisLoadFraction: totalLeaves > 0 ? maxAxisLoad / totalLeaves : 0,
    trunkLeafFraction: totalLeaves > 0 ? trunkLeaves / totalLeaves : 0,
    leftRightImbalance:
      sideCount > 0 ? Math.abs(left - right) / sideCount : 0,
    meanHostAgeAtAttachment:
      totalLeaves > 0 ? totalHostAge / totalLeaves : 0,
  };
}
