"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";

/* ── Sentry design tokens (inline) ─────────────────────── */
const INK = "#0A0A0C";
const INK2 = "#111114";
const BONE = "#F5F1E8";
const ACCENT = "#FF5B1F";
const ACCENT2 = "#D4FF00";
const ACCENT3 = "#8EC5FF";
const MUTED = "#8a8786";

/* ── Agent definitions ─────────────────────────────────── */
const AGENTS = [
  { id: "research", label: "Research", angle: -90, statusText: "Analyzing..." },
  { id: "code", label: "Code", angle: 0, statusText: "Generating..." },
  { id: "review", label: "Review", angle: 90, statusText: "Checking..." },
  { id: "deploy", label: "Deploy", angle: 180, statusText: "Done \u2713" },
] as const;

/* ── Fake streaming output lines ───────────────────────── */
const OUTPUT_LINES = [
  "$ agent orchestrate --pipeline full",
  "  [research] Fetching context from 3 sources...",
  "  [code] Generating implementation...",
  "  [review] Running 14 checks... all passed",
  "  [deploy] Build complete. Deployed to edge.",
  "  \u2713 Pipeline finished in 4.2s",
];

/* ── Helpers ────────────────────────────────────────────── */
const RADIUS = 130;
const CENTER = { x: 200, y: 180 };

function agentPos(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER.x + RADIUS * Math.cos(rad),
    y: CENTER.y + RADIUS * Math.sin(rad),
  };
}

/* ── Glass node styling ────────────────────────────────── */
const glassNode: React.CSSProperties = {
  background: `color-mix(in oklab, ${INK} 55%, transparent)`,
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  border: `1px solid color-mix(in oklab, ${BONE} 12%, transparent)`,
  borderRadius: 16,
};

/* ── Main component ────────────────────────────────────── */
export function AgentFlowViz({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.4 });
  const reduced = useReducedMotion();

  /* Animation state machine */
  const [phase, setPhase] = useState(-1); // -1 idle, 0 pulse, 1-4 agents, 5 all glow, 6 reset
  const [activeAgent, setActiveAgent] = useState<number>(-1);
  const [streamIdx, setStreamIdx] = useState(0);
  const [streamChar, setStreamChar] = useState(0);
  const [allGlow, setAllGlow] = useState(false);

  /* Reset everything */
  const reset = useCallback(() => {
    setPhase(-1);
    setActiveAgent(-1);
    setStreamIdx(0);
    setStreamChar(0);
    setAllGlow(false);
  }, []);

  /* Main sequencer */
  useEffect(() => {
    if (!isInView || reduced) {
      reset();
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const t = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };

    function runCycle() {
      /* Phase 0 — orchestrator pulse */
      setPhase(0);

      /* Phase 1-4 — each agent in sequence */
      AGENTS.forEach((_, i) => {
        const delay = 800 + i * 1800;
        t(() => {
          setPhase(i + 1);
          setActiveAgent(i);
          setStreamIdx(i + 1);
          setStreamChar(0);
        }, delay);
      });

      /* Phase 5 — all glow */
      t(() => {
        setPhase(5);
        setAllGlow(true);
        setStreamIdx(5);
      }, 800 + 4 * 1800);

      /* Phase 6 — reset and loop */
      t(() => {
        setAllGlow(false);
        reset();
        t(runCycle, 600);
      }, 800 + 4 * 1800 + 1400);
    }

    const startTimer = setTimeout(runCycle, 400);
    timers.push(startTimer);

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isInView, reduced, reset]);

  /* Streaming text effect */
  useEffect(() => {
    if (streamIdx < 0 || streamIdx >= OUTPUT_LINES.length) return;
    const line = OUTPUT_LINES[streamIdx];
    if (streamChar >= line.length) return;

    const timer = setTimeout(() => {
      setStreamChar((c) => c + 1);
    }, 18);
    return () => clearTimeout(timer);
  }, [streamIdx, streamChar]);

  /* Build displayed output text */
  const outputText = OUTPUT_LINES.slice(0, streamIdx)
    .concat(
      streamIdx < OUTPUT_LINES.length
        ? [OUTPUT_LINES[streamIdx].slice(0, streamChar)]
        : []
    )
    .join("\n");

  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 440,
        margin: "0 auto",
        fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
      }}
    >
      {/* ── SVG layer: lines + dots ── */}
      <svg
        viewBox="0 0 400 360"
        fill="none"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        {/* Connection lines */}
        {AGENTS.map((agent, i) => {
          const pos = agentPos(agent.angle);
          const isActive = activeAgent >= i || allGlow;
          return (
            <line
              key={agent.id}
              x1={CENTER.x}
              y1={CENTER.y}
              x2={pos.x}
              y2={pos.y}
              stroke={isActive ? ACCENT : `${BONE}15`}
              strokeWidth={isActive ? 1.5 : 1}
              strokeDasharray={isActive ? "none" : "4 4"}
              style={{
                transition: "stroke 0.4s, stroke-width 0.4s",
              }}
            />
          );
        })}

        {/* Traveling dots */}
        {AGENTS.map((agent, i) => {
          const pos = agentPos(agent.angle);
          const isMoving = phase === i + 1;
          if (!isMoving) return null;

          return (
            <motion.circle
              key={`dot-${agent.id}`}
              r={4}
              fill={ACCENT}
              filter="url(#glow)"
              initial={{ cx: CENTER.x, cy: CENTER.y, opacity: 1 }}
              animate={{ cx: pos.x, cy: pos.y }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
          );
        })}

        {/* Glow filter */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-lg" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Center orchestrator node ── */}
        <g>
          <motion.rect
            x={CENTER.x - 52}
            y={CENTER.y - 28}
            width={104}
            height={56}
            rx={16}
            fill={INK2}
            stroke={ACCENT}
            strokeWidth={phase >= 0 ? 2 : 1}
            filter={phase === 0 || allGlow ? "url(#glow-lg)" : undefined}
            animate={
              phase === 0
                ? { strokeOpacity: [1, 0.4, 1] }
                : allGlow
                  ? { stroke: ACCENT2 }
                  : {}
            }
            transition={phase === 0 ? { duration: 0.8, repeat: 1 } : { duration: 0.4 }}
            style={{
              transition: "stroke-width 0.3s",
            }}
          />
          <text
            x={CENTER.x}
            y={CENTER.y - 4}
            textAnchor="middle"
            fill={BONE}
            fontSize={11}
            fontWeight={600}
          >
            Orchestrator
          </text>
          <text
            x={CENTER.x}
            y={CENTER.y + 14}
            textAnchor="middle"
            fill={MUTED}
            fontSize={9}
          >
            {phase >= 0 ? "Running..." : "Idle"}
          </text>
        </g>

        {/* ── Satellite agent nodes ── */}
        {AGENTS.map((agent, i) => {
          const pos = agentPos(agent.angle);
          const isActive = activeAgent === i;
          const isDone = activeAgent > i || allGlow;
          const nodeColor = allGlow ? ACCENT2 : isActive ? ACCENT : isDone ? ACCENT3 : `${BONE}20`;

          return (
            <g key={agent.id}>
              <motion.rect
                x={pos.x - 44}
                y={pos.y - 24}
                width={88}
                height={48}
                rx={12}
                fill={INK2}
                stroke={nodeColor}
                strokeWidth={isActive || allGlow ? 1.5 : 1}
                filter={isActive ? "url(#glow)" : undefined}
                animate={
                  allGlow ? { stroke: ACCENT2, strokeOpacity: [1, 0.5, 1] } : {}
                }
                transition={{ duration: 0.6 }}
                style={{ transition: "stroke 0.3s" }}
              />
              <text
                x={pos.x}
                y={pos.y - 4}
                textAnchor="middle"
                fill={BONE}
                fontSize={10}
                fontWeight={600}
              >
                {agent.label}
              </text>
              <AnimatePresence>
                {(isActive || (isDone && i === 3)) && (
                  <motion.text
                    x={pos.x}
                    y={pos.y + 12}
                    textAnchor="middle"
                    fill={i === 3 && isDone ? ACCENT2 : ACCENT}
                    fontSize={8}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {agent.statusText}
                  </motion.text>
                )}
              </AnimatePresence>
            </g>
          );
        })}
      </svg>

      {/* ── Streaming output panel ── */}
      <div
        style={{
          ...glassNode,
          marginTop: 12,
          padding: "12px 16px",
          fontSize: 10,
          lineHeight: 1.7,
          color: ACCENT3,
          minHeight: 100,
          overflow: "hidden",
          whiteSpace: "pre",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
            color: MUTED,
            fontSize: 9,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          <span>Output</span>
          <span style={{ color: phase >= 0 ? ACCENT2 : MUTED }}>
            {phase >= 5 ? "Complete" : phase >= 0 ? "Running" : "Idle"}
          </span>
        </div>
        <div style={{ color: `${BONE}cc` }}>{outputText}</div>
        {phase >= 0 && phase < 5 && (
          <motion.span
            style={{ color: ACCENT }}
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            _
          </motion.span>
        )}
      </div>
    </div>
  );
}
