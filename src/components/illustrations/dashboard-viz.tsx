"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/cn";

/* ── colour tokens ──────────────────────────────────────────────── */
const BONE = "#F5F1E8";
const ACCENT = "#FF5B1F";

/* ── chart data (normalised 0–1) ────────────────────────────────── */
const CHART_POINTS = [
  [0, 0.72],
  [0.08, 0.65],
  [0.16, 0.7],
  [0.24, 0.58],
  [0.32, 0.62],
  [0.4, 0.48],
  [0.48, 0.52],
  [0.56, 0.38],
  [0.62, 0.42],
  [0.7, 0.3],
  [0.78, 0.35],
  [0.85, 0.22],
  [0.92, 0.18],
  [1, 0.12],
] as const;

function buildChartPath(
  width: number,
  height: number,
  padX: number,
  padY: number
): string {
  const w = width - padX * 2;
  const h = height - padY * 2;
  const pts = CHART_POINTS.map(([x, y]) => [padX + x * w, padY + y * h]);

  /* smooth cubic bezier through points */
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const cpx1 = prev[0] + (cur[0] - prev[0]) * 0.4;
    const cpx2 = prev[0] + (cur[0] - prev[0]) * 0.6;
    d += ` C${cpx1},${prev[1]} ${cpx2},${cur[1]} ${cur[0]},${cur[1]}`;
  }
  return d;
}

/* ── activity items ─────────────────────────────────────────────── */
const ACTIVITIES = [
  "New deployment completed",
  "User milestone: 2.5K",
  "Performance: A+",
];

/* ── counter animation hook ─────────────────────────────────────── */
function useCounter(
  target: number,
  decimals: number,
  play: boolean,
  duration = 2000
): string {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!play) {
      setValue(target);
      return;
    }
    setValue(0);
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - t) ** 3; // easeOut
      setValue(eased * target);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, target, duration]);

  return value.toFixed(decimals);
}

/* ── metric card sub-component ──────────────────────────────────── */
function MetricCard({
  label,
  target,
  suffix,
  decimals,
  play,
}: {
  label: string;
  target: number;
  suffix: string;
  decimals: number;
  play: boolean;
}) {
  const display = useCounter(target, decimals, play);

  return (
    <div className="flex flex-1 flex-col gap-1 rounded-lg border border-bone/8 bg-[#0E0E11] px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        {/* green pulsing dot */}
        <span className="relative inline-flex h-1.5 w-1.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        <span className="font-mono text-[9px] uppercase tracking-wider text-bone/40">
          {label}
        </span>
      </div>
      <span className="font-mono text-sm font-medium tabular-nums text-bone/90">
        {display}
        {suffix}
      </span>
    </div>
  );
}

/* ── chart dimensions ───────────────────────────────────────────── */
const CHART_W = 440;
const CHART_H = 100;
const CHART_PAD_X = 8;
const CHART_PAD_Y = 8;
const CHART_D = buildChartPath(CHART_W, CHART_H, CHART_PAD_X, CHART_PAD_Y);

/* ── main component ─────────────────────────────────────────────── */
export function DashboardViz({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();

  const play = inView && !reduced;
  const showFinal = reduced && inView;

  /* chart stroke animation */
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(800);
  const [chartProgress, setChartProgress] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      setPathLen(pathRef.current.getTotalLength());
    }
  }, []);

  useEffect(() => {
    if (showFinal) {
      setChartProgress(1);
      return;
    }
    if (!play) return;
    setChartProgress(0);
    const start = performance.now();
    const dur = 2200;
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - (1 - t) ** 2;
      setChartProgress(eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, showFinal]);

  const dashOffset = pathLen * (1 - chartProgress);

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full overflow-hidden rounded-[20px] border border-bone/12 bg-[#111114]",
        className
      )}
    >
      {/* ── browser chrome bar ──────────────────────────────────── */}
      <div className="flex items-center gap-1.5 border-b border-bone/8 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-bone/15" />
        <span className="h-2 w-2 rounded-full bg-bone/15" />
        <span className="h-2 w-2 rounded-full bg-bone/15" />
        <span className="ml-3 font-mono text-[9px] uppercase tracking-wider text-bone/25">
          dashboard
        </span>
      </div>

      <div className="flex flex-col gap-3 p-3">
        {/* ── metric cards row ──────────────────────────────────── */}
        <div className="flex gap-2">
          <MetricCard
            label="Active Users"
            target={2847}
            suffix=""
            decimals={0}
            play={play || showFinal}
          />
          <MetricCard
            label="Conversion"
            target={12.4}
            suffix="%"
            decimals={1}
            play={play || showFinal}
          />
          <MetricCard
            label="Uptime"
            target={99.9}
            suffix="%"
            decimals={1}
            play={play || showFinal}
          />
        </div>

        {/* ── line chart ────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-lg border border-bone/8 bg-[#0E0E11] p-2">
          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            className="w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient
                id="chart-fill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={ACCENT} stopOpacity="0.15" />
                <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
              </linearGradient>
              <filter id="dv-glow" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <clipPath id="chart-clip">
                <rect
                  x="0"
                  y="0"
                  width={CHART_W * chartProgress}
                  height={CHART_H}
                />
              </clipPath>
            </defs>

            {/* grid lines */}
            {[0.25, 0.5, 0.75].map((f) => (
              <line
                key={f}
                x1={CHART_PAD_X}
                y1={CHART_PAD_Y + f * (CHART_H - CHART_PAD_Y * 2)}
                x2={CHART_W - CHART_PAD_X}
                y2={CHART_PAD_Y + f * (CHART_H - CHART_PAD_Y * 2)}
                stroke={`${BONE}0A`}
                strokeWidth="0.5"
              />
            ))}

            {/* area fill — clipped by progress */}
            <path
              d={`${CHART_D} L${CHART_W - CHART_PAD_X},${CHART_H - CHART_PAD_Y} L${CHART_PAD_X},${CHART_H - CHART_PAD_Y} Z`}
              fill="url(#chart-fill)"
              clipPath="url(#chart-clip)"
            />

            {/* main line with stroke-dasharray draw */}
            <path
              ref={pathRef}
              d={CHART_D}
              fill="none"
              stroke={ACCENT}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={pathLen}
              strokeDashoffset={dashOffset}
              filter="url(#dv-glow)"
            />
          </svg>
        </div>

        {/* ── activity feed ─────────────────────────────────────── */}
        <div className="flex flex-col gap-1.5">
          {ACTIVITIES.map((text, i) => {
            const delay = 1.6 + i * 0.4;
            return (
              <motion.div
                key={text}
                className="flex items-center gap-2 rounded-md border border-bone/6 bg-[#0E0E11] px-3 py-1.5"
                initial={reduced ? false : { opacity: 0, x: -8 }}
                animate={
                  play || showFinal
                    ? { opacity: 1, x: 0 }
                    : reduced
                    ? { opacity: 1, x: 0 }
                    : undefined
                }
                transition={{
                  duration: 0.5,
                  delay: reduced ? 0 : delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <span className="h-1 w-1 rounded-full bg-accent/60" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-bone/50">
                  {text}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
