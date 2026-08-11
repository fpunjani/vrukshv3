import { useMemo, useState } from "react";
import {
  projectCanopyClusters,
  type ClusterDetailLevel,
} from "../domain/canopy-geometry";
import { projectFoliageMarks } from "../domain/foliage-geometry";
import {
  outlineProjectedCurve,
  projectTreeCurves,
  sampleProjectedCurve,
  type ProjectedCurve,
} from "../domain/geometry";
import { replayEntries } from "../domain/growth";
import { projectLeafForms, type ProjectedLeafForm } from "../domain/leaf-form";
import type { Entry, Point, TreeState } from "../domain/types";

const MILESTONES = [0, 1, 3, 10, 30, 100, 300, 1000] as const;
const COMPARE_SEEDS = [
  "ash-01",
  "ash-02",
  "ash-03",
  "ash-04",
  "ash-05",
  "ash-06",
  "ash-07",
  "ash-08",
] as const;

interface ViewBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

function params(): URLSearchParams {
  return typeof window === "undefined"
    ? new URLSearchParams()
    : new URLSearchParams(window.location.search);
}

function initialCount(): number {
  const raw = Number(params().get("count"));
  if (!Number.isFinite(raw)) return 100;
  return Math.max(0, Math.min(1000, Math.round(raw)));
}

function initialTimelineSoul(): string {
  return params().get("soul")?.trim() || "ash-01";
}

function initialAttachmentMode(): boolean {
  return params().get("attachments") === "1";
}

function initialLeafMode(): boolean {
  return params().get("leaves") === "1";
}

function initialLodMode(): ClusterDetailLevel | null {
  const value = params().get("lod");
  return value === "module" || value === "axis" ? value : null;
}

function makeEntries(count: number): Entry[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `entry-${index + 1}`,
    text: `Growth event ${index + 1}`,
    createdAt: Date.UTC(2026, 0, 1) + index * 86_400_000,
    status: "open" as const,
  }));
}

function boundsForCurves(groups: readonly ProjectedCurve[][]): ViewBox {
  const curves = groups.flat();
  if (curves.length === 0) {
    return { minX: -45, maxX: 45, minY: -100, maxY: 12 };
  }

  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;
  for (const curve of curves) {
    for (const point of sampleProjectedCurve(curve, 8)) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }
  }

  const width = Math.max(60, maxX - minX);
  const height = Math.max(90, maxY - minY);
  const padX = width * 0.14;
  const padY = height * 0.1;
  return {
    minX: minX - padX,
    maxX: maxX + padX,
    minY: minY - padY,
    maxY: maxY + padY,
  };
}

function polygonPath(points: readonly Point[]): string {
  if (points.length === 0) return "";
  return `${points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x.toFixed(3)} ${point.y.toFixed(3)}`,
    )
    .join(" ")} Z`;
}

function leafPath(leaf: ProjectedLeafForm): string {
  return [
    `M ${leaf.base.x.toFixed(3)} ${leaf.base.y.toFixed(3)}`,
    `C ${leaf.leftControl1.x.toFixed(3)} ${leaf.leftControl1.y.toFixed(3)} ${leaf.leftControl2.x.toFixed(3)} ${leaf.leftControl2.y.toFixed(3)} ${leaf.tip.x.toFixed(3)} ${leaf.tip.y.toFixed(3)}`,
    `C ${leaf.rightControl2.x.toFixed(3)} ${leaf.rightControl2.y.toFixed(3)} ${leaf.rightControl1.x.toFixed(3)} ${leaf.rightControl1.y.toFixed(3)} ${leaf.base.x.toFixed(3)} ${leaf.base.y.toFixed(3)}`,
    "Z",
  ].join(" ");
}

function directionAngle(direction: Point): number {
  return (Math.atan2(direction.y, direction.x) * 180) / Math.PI;
}

function Skeleton({
  state,
  viewBox,
  showAttachments,
  showLeaves,
  lodMode,
}: {
  state: TreeState;
  viewBox: ViewBox;
  showAttachments: boolean;
  showLeaves: boolean;
  lodMode: ClusterDetailLevel | null;
}) {
  const curves = useMemo(() => projectTreeCurves(state), [state]);
  const marks = useMemo(
    () => (showAttachments && !lodMode ? projectFoliageMarks(state) : []),
    [lodMode, showAttachments, state],
  );
  const leaves = useMemo(
    () => (showLeaves && !lodMode ? projectLeafForms(state) : []),
    [lodMode, showLeaves, state],
  );
  const clusters = useMemo(
    () => (lodMode ? projectCanopyClusters(state, lodMode) : []),
    [lodMode, state],
  );
  const width = viewBox.maxX - viewBox.minX;
  const height = viewBox.maxY - viewBox.minY;
  const modeLabel = lodMode
    ? ` with ${lodMode} canopy LOD`
    : showLeaves
      ? " with Leaf Form V1"
      : showAttachments
        ? " with foliage attachment marks"
        : "";

  return (
    <svg
      className="skeleton"
      viewBox={`${viewBox.minX} ${viewBox.minY} ${width} ${height}`}
      role="img"
      aria-label={`Tree skeleton after ${state.growthIndex} growth events${modeLabel}`}
    >
      <line x1={-500} y1={0} x2={500} y2={0} className="ground" />

      {[...clusters]
        .sort((a, b) => a.depth - b.depth || a.key.localeCompare(b.key))
        .map((cluster) => (
          <ellipse
            key={cluster.key}
            cx={cluster.center.x}
            cy={cluster.center.y}
            rx={cluster.length / 2}
            ry={cluster.width / 2}
            transform={`rotate(${directionAngle(cluster.direction)} ${cluster.center.x} ${cluster.center.y})`}
            className={`canopy-cluster canopy-cluster-${cluster.level}`}
          >
            <title>{`${cluster.memberCount} permanent identities / ${cluster.key}`}</title>
          </ellipse>
        ))}

      {leaves.map((leaf) => (
        <g key={leaf.entryId} className={`leaf-form leaf-order-${Math.min(4, leaf.order)}`}>
          <line
            x1={leaf.stemOrigin.x}
            y1={leaf.stemOrigin.y}
            x2={leaf.base.x}
            y2={leaf.base.y}
            className="leaf-petiole"
          />
          <path d={leafPath(leaf)} className="leaf-blade" />
        </g>
      ))}

      {curves.map((curve) => (
        <path
          key={curve.id}
          d={polygonPath(outlineProjectedCurve(curve, 12))}
          className={`wood wood-order-${Math.min(4, curve.order)}`}
        />
      ))}

      {marks.map((mark) => (
        <g key={mark.entryId} className="attachment-mark">
          <line
            x1={mark.anchor.x}
            y1={mark.anchor.y}
            x2={mark.point.x}
            y2={mark.point.y}
            className="attachment-stem"
          />
          <circle
            cx={mark.point.x}
            cy={mark.point.y}
            r={0.72}
            className="attachment-dot"
          />
        </g>
      ))}
    </svg>
  );
}

function TreeCard({
  soul,
  count,
  state,
  viewBox,
  showAttachments,
  showLeaves,
  lodMode,
}: {
  soul: string;
  count: number;
  state: TreeState;
  viewBox: ViewBox;
  showAttachments: boolean;
  showLeaves: boolean;
  lodMode: ClusterDetailLevel | null;
}) {
  const primitiveCount = useMemo(
    () => (lodMode ? projectCanopyClusters(state, lodMode).length : null),
    [lodMode, state],
  );

  return (
    <article className="tree-card">
      <div className="tree-card-meta">
        <strong>{soul}</strong>
        <span>{count} entries</span>
      </div>
      <Skeleton
        state={state}
        viewBox={viewBox}
        showAttachments={showAttachments}
        showLeaves={showLeaves}
        lodMode={lodMode}
      />
      <div className="tree-stats">
        <span>{state.modules.length} structural modules</span>
        <span>{state.leaves.length} persistent leaf identities</span>
        {primitiveCount !== null ? <span>{primitiveCount} visible LOD primitives</span> : null}
      </div>
    </article>
  );
}

export function TreeLab() {
  const [count, setCount] = useState(initialCount);
  const [timelineSoul, setTimelineSoul] = useState(initialTimelineSoul);
  const [showAttachments] = useState(initialAttachmentMode);
  const [showLeaves] = useState(initialLeafMode);
  const [lodMode] = useState<ClusterDetailLevel | null>(initialLodMode);

  const identityStates = useMemo(
    () =>
      COMPARE_SEEDS.map((soul) => ({
        soul,
        state: replayEntries(soul, makeEntries(count)),
      })),
    [count],
  );
  const identityViewBox = useMemo(
    () => boundsForCurves(identityStates.map(({ state }) => projectTreeCurves(state))),
    [identityStates],
  );
  const timelineStates = useMemo(
    () =>
      MILESTONES.slice(1).map((milestone) => ({
        milestone,
        state: replayEntries(timelineSoul, makeEntries(milestone)),
      })),
    [timelineSoul],
  );
  const timelineViewBox = useMemo(
    () => boundsForCurves(timelineStates.map(({ state }) => projectTreeCurves(state))),
    [timelineStates],
  );

  const modeTitle = lodMode
    ? `${lodMode === "module" ? "Medium" : "Far"} canopy LOD`
    : showLeaves
      ? "Leaf Form V1"
      : showAttachments
        ? "Attachment debug mode"
        : "Current rule";
  const modeDescription = lodMode
    ? "Every diagnostic mass is a stable traceable bucket of permanent identities; accepted wood remains visible on top."
    : showLeaves
      ? "Every visible blade is derived from one permanent identity and its historical wood attachment."
      : showAttachments
        ? "Each dot is one permanent entry identity attached to historical wood."
        : "N + 1 may extend N. It may never rewrite N's history.";

  return (
    <main className="lab-shell">
      <header className="lab-header">
        <div>
          <p className="eyebrow">Vruksh V3 / layered acceptance</p>
          <h1>Tree Lab</h1>
          <p className="intro">
            Historical topology and foliage attachment are persistent. Curved
            wood, Leaf Form V1, and canopy LOD are deterministic projections.
            Shared framing prevents auto-fit from hiding weak trees or canopies.
          </p>
        </div>
        <div className="status-card">
          <span>{modeTitle}</span>
          <strong>{modeDescription}</strong>
        </div>
      </header>

      <section className="control-panel" aria-label="Tree Lab controls">
        <div className="control-row">
          <label htmlFor="entry-count">Entry count</label>
          <output htmlFor="entry-count">{count}</output>
        </div>
        <input
          id="entry-count"
          type="range"
          min="0"
          max="1000"
          step="1"
          value={count}
          onChange={(event) => setCount(Number(event.target.value))}
        />
        <div className="milestone-row">
          {MILESTONES.map((milestone) => (
            <button
              key={milestone}
              type="button"
              className={count === milestone ? "active" : ""}
              onClick={() => setCount(milestone)}
            >
              {milestone}
            </button>
          ))}
        </div>
      </section>

      <section className="lab-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Identity matrix / shared scale</p>
            <h2>Same life stage, different souls</h2>
          </div>
          <p>Every tree uses the same view box at this milestone.</p>
        </div>
        <div className="tree-grid">
          {identityStates.map(({ soul, state }) => (
            <TreeCard
              key={soul}
              soul={soul}
              count={count}
              state={state}
              viewBox={identityViewBox}
              showAttachments={showAttachments}
              showLeaves={showLeaves}
              lodMode={lodMode}
            />
          ))}
        </div>
      </section>

      <section className="lab-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Growth continuity / shared scale</p>
            <h2>The same organism over time</h2>
          </div>
          <label className="seed-input">
            Soul
            <input
              value={timelineSoul}
              onChange={(event) => setTimelineSoul(event.target.value || "ash-01")}
            />
          </label>
        </div>
        <div className="timeline-grid">
          {timelineStates.map(({ milestone, state }) => (
            <TreeCard
              key={milestone}
              soul={timelineSoul}
              count={milestone}
              state={state}
              viewBox={timelineViewBox}
              showAttachments={showAttachments}
              showLeaves={showLeaves}
              lodMode={lodMode}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
