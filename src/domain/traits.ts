import { keyedRange } from "./random";

export interface TreeTraits {
  lean: number;
  apicalDominance: number;
  branchAngle: number;
  curvature: number;
  crownAspect: number;
}

export function deriveTreeTraits(soul: string): TreeTraits {
  return {
    lean: keyedRange(soul, "trait:lean", -6, 6),
    apicalDominance: keyedRange(soul, "trait:apical-dominance", 0.58, 0.84),
    branchAngle: keyedRange(soul, "trait:branch-angle", 28, 44),
    curvature: keyedRange(soul, "trait:curvature", 3.8, 7.8),
    crownAspect: keyedRange(soul, "trait:crown-aspect", 0.55, 0.88),
  };
}
