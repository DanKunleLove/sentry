"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/cn";

/* ── colour tokens ──────────────────────────────────────────────── */
const INK2 = "#111114";
const BONE = "#F5F1E8";
const ACCENT = "#FF5B1F";

/* ── node definitions ───────────────────────────────────────────── */
type Node = {
  id: string;
  label: string;
  x: number;
  y: number;
};

const NODES: Node[] = [
  { id: "webhook", label: "Webhook", x: 40, y: 125 },
  { id: "parse", label: "Parse Data", x: 170, y: 125 },
  { id: "classify", label: "AI Classify", x: 300, y: 125 },
  { id: "branch", label: "Branch", x: 430, y: 125 },
  { id: "crm", label: "CRM Update", x: 570, y: 65 },
  { id: "notify", label: "Send Notification", x: 570, y: 185 },
];

/* ── connections (index pairs → SVG path data) ──────────────────── */
type Connection = { from: number; to: number; path: string };

const NODE_W = 100;
const NODE_H = 36;

function linePath(from: Node, to: Node): string {
  const x1 = from.x + NODE_W;
  const y1 = from.y + NODE_H / 2;
  const x2 = to.x;
  const y2 = to.y + NODE_H / 2;
  const cx = (x1 + x2) / 2;
  return `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`;
}

const CONNECTIONS: Connection[] = [
  { from: 0, to: 1, path: linePath(NODES[0], NODES[1]) },
  { from: 1, to: 2, path: linePath(NODES[1], NODES[2]) },
  { from: 2, to: 3, path: linePath(NODES[2], NODES[3]) },
  { from: 3, to: 4, path: linePath(NODES[3], NODES[4]) },
  { from: 3, to: 5, path: linePath(NODES[3], NODES[5]) },
];

/* ── timing (seconds) ─────────────────────────────────────────── */
const LOOP = 8;
const PULSE_TRAVEL = 0.6;
const NODE_GLOW = 0.5;

/*
  Sequence:
  0.0  – pulse travels to webhook          (arrives 0.6)
  0.6  – webhook glows
  1.1  – pulse to parse                    (arrives 1.7)
  1.7  – parse glows
  2.2  – pulse to classify                 (arrives 2.8)
  2.8  – classify glows
  3.3  – pulse to branch                   (arrives 3.9)
  3.9  – branch glows
  4.4  – pulse to crm AND notify           (arrive 5.0)
  5.0  – crm + notify glow
  5.5  – hold completed state
  7.0  – reset for next loop
*/
const SCHEDULE: { nodeIdx: number; glowStart: number }[] = [
  { nodeIdx: 0, glowStart: 0.6 },
  { nodeIdx: 1, glowStart: 1.7 },
  { nodeIdx: 2, glowStart: 2.8 },
  { nodeIdx: 3, glowStart: 3.9 },
  { nodeIdx: 4, glowStart: 5.0 },
  { nodeIdx: 5, glowStart: 5.0 },
];

const EDGE_SCHEDULE: { connIdx: number; start: number }[] = [
  { connIdx: 0, start: 0.0 },
  { connIdx: 1, start: 1.1 },
  { connIdx: 2, start: 2.2 },
  { connIdx: 3, start: 3.3 },
  { connIdx: 4, start: 4.4 },
];

/* ── SVG viewbox ────────────────────────────────────────────────── */
const VB_W = 700;
const VB_H = 250;

/* ── main component ─────────────────────────────────────────────── */
export function WorkflowViz({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });
  const reduced = useReducedMotion();

  /* animation clock — seconds since animation started, mod LOOP */
  const [clock, setClock] = useState(0);
  const [ops, setOps] = useState(0);
  const running = inView && !reduced;

  useEffect(() => {
    if (!running) return;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      setClock(elapsed % LOOP);
      /* ops counter: ramp from 0→276 over the first ~5.5s of each loop */
      const loopElapsed = elapsed % LOOP;
      const progress = Math.min(loopElapsed / 5.5, 1);
      setOps(Math.round(276 * easeOut(progress)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  /* If reduced motion, show completed static state */
  const showCompleted = reduced;

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full overflow-hidden rounded-[20px] border border-bone/12 bg-[#111114]",
        "h-[300px] md:h-[250px]",
        className
      )}
    >
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* accent glow filter */}
          <filter id="wf-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* pulse gradient along path */}
          <linearGradient id="pulse-grad">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0" />
            <stop offset="40%" stopColor={ACCENT} stopOpacity="1" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ── connection lines ─────────────────────────────────── */}
        {CONNECTIONS.map((c, i) => (
          <g key={`conn-${i}`}>
            {/* base line */}
            <path
              d={c.path}
              fill="none"
              stroke={`${BONE}26`}
              strokeWidth="1.5"
            />
            {/* animated pulse */}
            {(running || showCompleted) && (
              <PulsePath
                d={c.path}
                clock={clock}
                start={EDGE_SCHEDULE[i].start}
                duration={PULSE_TRAVEL}
                completed={showCompleted}
              />
            )}
          </g>
        ))}

        {/* ── nodes ────────────────────────────────────────────── */}
        {NODES.map((node, i) => {
          const sched = SCHEDULE[i];
          const active =
            showCompleted ||
            (running && clock >= sched.glowStart && clock < sched.glowStart + NODE_GLOW);
          const completed =
            showCompleted || (running && clock >= sched.glowStart);

          return (
            <g key={node.id}>
              {/* glow behind node */}
              {active && (
                <rect
                  x={node.x - 4}
                  y={node.y - 4}
                  width={NODE_W + 8}
                  height={NODE_H + 8}
                  rx="12"
                  fill="none"
                  stroke={ACCENT}
                  strokeWidth="1.5"
                  filter="url(#wf-glow)"
                  opacity={0.7}
                />
              )}

              {/* card bg */}
              <rect
                x={node.x}
                y={node.y}
                width={NODE_W}
                height={NODE_H}
                rx="8"
                fill={INK2}
                stroke={active ? ACCENT : `${BONE}1F`}
                strokeWidth={active ? 1.5 : 1}
              />

              {/* label */}
              <text
                x={node.x + (completed ? 8 : NODE_W / 2)}
                y={node.y + NODE_H / 2 + 1}
                fill={completed ? ACCENT : `${BONE}99`}
                fontSize="10"
                fontFamily="var(--font-jetbrains), monospace"
                textAnchor={completed ? "start" : "middle"}
                dominantBaseline="middle"
                letterSpacing="0.04em"
              >
                {node.label}
              </text>

              {/* checkmark */}
              {completed && (
                <g
                  transform={`translate(${node.x + NODE_W - 18}, ${node.y + NODE_H / 2 - 6})`}
                >
                  <path
                    d="M2.5 6.5L5 9L9.5 3.5"
                    fill="none"
                    stroke={ACCENT}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* ── operations counter ──────────────────────────────────── */}
      <div className="absolute bottom-3 left-4 font-mono text-[10px] uppercase tracking-wider text-bone/50">
        Operations:{" "}
        <span className="text-accent">{showCompleted ? 276 : ops}</span>
      </div>
    </div>
  );
}

/* ── pulse traveller along a path ───────────────────────────────── */
function PulsePath({
  d,
  clock,
  start,
  duration,
  completed,
}: {
  d: string;
  clock: number;
  start: number;
  duration: number;
  completed: boolean;
}) {
  if (completed) {
    return (
      <path d={d} fill="none" stroke={ACCENT} strokeWidth="2" opacity={0.4} />
    );
  }

  const progress = (clock - start) / duration;
  if (progress < 0 || progress > 1) return null;

  /* Draw a short segment of the path to simulate the pulse. */
  const dashLen = 30;
  const offset = (1 - progress) * 200 + dashLen;

  return (
    <path
      d={d}
      fill="none"
      stroke={ACCENT}
      strokeWidth="2.5"
      strokeDasharray={`${dashLen} 500`}
      strokeDashoffset={offset}
      filter="url(#wf-glow)"
      opacity={0.9}
    />
  );
}

/* ── easing helper ──────────────────────────────────────────────── */
function easeOut(t: number): number {
  return 1 - (1 - t) ** 3;
}
