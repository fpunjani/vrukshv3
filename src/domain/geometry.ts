import { pointFrom } from "./spatial";
import type { GrowthModule, Point, ProjectedSegment, TreeState } from "./types";
const ROOT: Point = { x: 0, y: 0 };
export interface ProjectedCurve extends ProjectedSegment { control1: Point; control2: Point; startTangent: number; endTangent: number; startThickness: number; endThickness: number; }
function normalizeDelta(degrees: number): number { return ((degrees + 540) % 360) - 180; }
function blendHeading(from: number, to: number, amount: number): number { return from + normalizeDelta(to - from) * amount; }
function supportByModule(modules: readonly GrowthModule[]): Map<string, number> {
  const support = new Map<string, number>(), childCount = new Map<string, number>();
  for (const module of modules) { support.set(module.id, 0); if (module.parentId) childCount.set(module.parentId, (childCount.get(module.parentId) ?? 0) + 1); }
  for (let index = modules.length - 1; index >= 0; index -= 1) { const module = modules[index], ownSupport = support.get(module.id) ?? 0, terminalSupport = (childCount.get(module.id) ?? 0) === 0 ? 1 : 0, total = Math.max(1, ownSupport + terminalSupport); support.set(module.id, total); if (module.parentId) support.set(module.parentId, (support.get(module.parentId) ?? 0) + total); }
  return support;
}
function projectedThickness(order: number, support: number): number { const orderScale = order === 0 ? 1 : Math.max(0.58, 0.88 - order * 0.08); return Math.max(0.9, Math.sqrt(support) * 1.48 * orderScale); }
export function projectTree(state: TreeState): ProjectedSegment[] {
  const projected = new Map<string, ProjectedSegment>(), support = supportByModule(state.modules), result: ProjectedSegment[] = [];
  for (const module of state.modules) {
    const parent = module.parentId ? projected.get(module.parentId) : undefined; if (module.parentId && !parent) throw new Error(`Growth module ${module.id} references missing parent ${module.parentId}`);
    const start = parent?.end ?? ROOT, heading = (parent?.heading ?? 0) + module.restTurn, length = module.restLength, end = pointFrom(start, heading, length);
    const segment: ProjectedSegment = { id: module.id, parentId: module.parentId, axisId: module.axisId, order: module.order, bornAtEvent: module.bornAtEvent, start, end, heading, length, thickness: projectedThickness(module.order, support.get(module.id) ?? 1) };
    projected.set(module.id, segment); result.push(segment);
  } return result;
}
function endThicknessBySegment(segments: readonly ProjectedSegment[], state: TreeState): Map<string, number> {
  const segmentById = new Map(segments.map((segment) => [segment.id, segment])), continuationByParent = new Map<string, ProjectedSegment>();
  for (const module of state.modules) if (module.relation === "continuation" && module.parentId) { const continuation = segmentById.get(module.id); if (continuation) continuationByParent.set(module.parentId, continuation); }
  const result = new Map<string, number>(); for (const segment of segments) { const continuation = continuationByParent.get(segment.id); result.set(segment.id, continuation ? Math.max(0.82, continuation.thickness * 1.02) : Math.max(0.72, segment.thickness * 0.58)); } return result;
}
export function projectTreeCurves(state: TreeState): ProjectedCurve[] {
  const segments = projectTree(state), segmentById = new Map(segments.map((segment) => [segment.id, segment])), moduleById = new Map(state.modules.map((module) => [module.id, module])), continuationByParent = new Map<string, string>(), projectedEndThickness = endThicknessBySegment(segments, state);
  for (const module of state.modules) if (module.relation === "continuation" && module.parentId) continuationByParent.set(module.parentId, module.id);
  const endTangentById = new Map<string, number>(); for (const segment of segments) { const continuationId = continuationByParent.get(segment.id), continuation = continuationId ? segmentById.get(continuationId) : undefined; endTangentById.set(segment.id, continuation ? blendHeading(segment.heading, continuation.heading, 0.5) : segment.heading); }
  const curves = new Map<string, ProjectedCurve>(), result: ProjectedCurve[] = [];
  for (const segment of segments) {
    const module = moduleById.get(segment.id); if (!module) throw new Error(`Projected segment ${segment.id} has no growth module`);
    const parentSegment = segment.parentId ? segmentById.get(segment.parentId) : undefined, parentCurve = segment.parentId ? curves.get(segment.parentId) : undefined, parentEndTangent = segment.parentId ? endTangentById.get(segment.parentId) : undefined;
    let startTangent = segment.heading; if (module.relation === "continuation" && parentEndTangent !== undefined) startTangent = parentEndTangent; else if (module.relation === "lateral" && parentSegment) startTangent = blendHeading(parentSegment.heading, segment.heading, 0.72);
    const endTangent = endTangentById.get(segment.id) ?? segment.heading, startHandle = segment.length * (module.relation === "lateral" ? 0.24 : 0.32), endHandle = segment.length * 0.32, endThickness = projectedEndThickness.get(segment.id) ?? segment.thickness * 0.6;
    let startThickness = segment.thickness * 1.08; if (module.relation === "origin") startThickness = segment.thickness * 1.14; else if (module.relation === "continuation" && parentCurve) startThickness = parentCurve.endThickness; else if (module.relation === "lateral" && parentCurve) startThickness = Math.min(segment.thickness * 1.05, parentCurve.endThickness * 0.72);
    const curve: ProjectedCurve = { ...segment, control1: pointFrom(segment.start, startTangent, startHandle), control2: pointFrom(segment.end, endTangent + 180, endHandle), startTangent, endTangent, startThickness, endThickness: Math.min(startThickness, endThickness) };
    curves.set(curve.id, curve); result.push(curve);
  } return result;
}
function curvePoint(curve: ProjectedCurve, t: number): Point { const mt = 1 - t, mt2 = mt * mt, t2 = t * t; return { x: mt2 * mt * curve.start.x + 3 * mt2 * t * curve.control1.x + 3 * mt * t2 * curve.control2.x + t2 * t * curve.end.x, y: mt2 * mt * curve.start.y + 3 * mt2 * t * curve.control1.y + 3 * mt * t2 * curve.control2.y + t2 * t * curve.end.y }; }
export function sampleProjectedCurve(curve: ProjectedCurve, steps = 8): Point[] { const count = Math.max(1, Math.floor(steps)), points: Point[] = []; for (let index = 0; index <= count; index += 1) points.push(curvePoint(curve, index / count)); return points; }
export function outlineProjectedCurve(curve: ProjectedCurve, steps = 12): Point[] {
  const centerline = sampleProjectedCurve(curve, steps), left: Point[] = [], right: Point[] = [], last = centerline.length - 1;
  for (let index = 0; index < centerline.length; index += 1) { const previous = centerline[Math.max(0, index - 1)], next = centerline[Math.min(last, index + 1)], dx = next.x - previous.x, dy = next.y - previous.y, magnitude = Math.max(1e-9, Math.hypot(dx, dy)), nx = -dy / magnitude, ny = dx / magnitude, t = last === 0 ? 0 : index / last, thickness = curve.startThickness + (curve.endThickness - curve.startThickness) * t, radius = thickness / 2, point = centerline[index]; left.push({ x: point.x + nx * radius, y: point.y + ny * radius }); right.push({ x: point.x - nx * radius, y: point.y - ny * radius }); }
  return left.concat(right.reverse());
}
