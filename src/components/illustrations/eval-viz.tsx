"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/* ── Sentry design tokens ──────────────────────────────── */
const INK = "#0A0A0C";
const INK2 = "#111114";
const BONE = "#F5F1E8";
const ACCENT = "#FF5B1F";
const ACCENT2 = "#D4FF00";
const ACCENT3 = "#8EC5FF";
const MUTED = "#8a8786";

/* ── Fake response content ─────────────────────────────── */
const RESPONSE_A = [
  "The transformer architecture uses",
  "self-attention to weigh input tokens",
  "dynamically, enabling parallel processing",
  "and long-range dependency capture.",
];

const RESPONSE_B = [
  "Transformers are a type of neural",
  "network. They use attention. This",
  "makes them good at language tasks",
  "and other sequence problems.",
];

const SCORES = [
  { label: "Factuality", value: 9.2, color: ACCENT3 },
  { label: "Clarity", value: 8.8, color: ACCENT },
  { label: "Safety", value: 10.0, color: ACCENT2 },
];

/* ── Glass styling ─────────────────────────────────────── */
const glassCard: React.CSSProperties = {
  background: `color-mix(in oklab, ${INK} 55%, transparent)`,
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  border: `1px solid color-mix(in oklab, ${BONE} 12%, transparent)`,
  borderRadius: 20,
  padding: "16px 18px",
};

/* ── Component ─────────────────────────────────────────── */
export function EvalViz({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();

  /* Phase machine: 0=idle, 1=streaming A, 2=streaming B, 3=slider, 4=scores, 5=quality */
  const [phase, setPhase] = useState(0);
  const [linesA, setLinesA] = useState(0);
  const [linesB, setLinesB] = useState(0);
  const [sliderPos, setSliderPos] = useState(0.5);
  const [showScores, setShowScores] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const [qualityProgress, setQualityProgress] = useState(0);
  const [glowA, setGlowA] = useState(false);

  useEffect(() => {
    if (!isInView || reduced) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const t = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };

    /* Stream lines for A */
    setPhase(1);
    RESPONSE_A.forEach((_, i) => {
      t(() => setLinesA(i + 1), 300 + i * 400);
    });

    /* Stream lines for B */
    const bStart = 300 + RESPONSE_A.length * 400 + 200;
    t(() => setPhase(2), bStart);
    RESPONSE_B.forEach((_, i) => {
      t(() => setLinesB(i + 1), bStart + i * 400);
    });

    /* Slider */
    const sliderStart = bStart + RESPONSE_B.length * 400 + 500;
    t(() => {
      setPhase(3);
      setSliderPos(0.5);
    }, sliderStart);
    t(() => {
      setSliderPos(0.15);
      setGlowA(true);
    }, sliderStart + 400);

    /* Scores */
    const scoresStart = sliderStart + 1200;
    t(() => {
      setPhase(4);
      setShowScores(true);
    }, scoresStart);

    /* Quality */
    const qualityStart = scoresStart + 1000;
    t(() => {
      setPhase(5);
      setShowQuality(true);
    }, qualityStart);
    t(() => setQualityProgress(94), qualityStart + 200);

    return () => timers.forEach(clearTimeout);
  }, [isInView, reduced]);

  const easeOut = [0.22, 1, 0.36, 1] as const;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
        fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          fontSize: 10,
          color: MUTED,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        <span>RLHF Evaluation</span>
        <span style={{ color: phase >= 5 ? ACCENT2 : phase >= 1 ? ACCENT : MUTED }}>
          {phase >= 5 ? "Complete" : phase >= 1 ? "Evaluating" : "Pending"}
        </span>
      </div>

      {/* ── Response cards ── */}
      <div style={{ display: "flex", gap: 12 }}>
        {/* Response A */}
        <div
          style={{
            ...glassCard,
            flex: 1,
            position: "relative",
            borderColor: glowA
              ? ACCENT
              : `color-mix(in oklab, ${BONE} 12%, transparent)`,
            boxShadow: glowA
              ? `0 0 20px ${ACCENT}30, inset 0 1px 0 color-mix(in oklab, ${BONE} 18%, transparent)`
              : undefined,
            transition: "border-color 0.6s, box-shadow 0.6s",
          }}
        >
          <div
            style={{
              fontSize: 9,
              color: ACCENT3,
              fontWeight: 600,
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Response A
          </div>
          <div style={{ minHeight: 72 }}>
            {RESPONSE_A.slice(0, linesA).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: easeOut }}
                style={{ fontSize: 10, color: `${BONE}cc`, lineHeight: 1.6 }}
              >
                {line}
              </motion.div>
            ))}
          </div>
          {glowA && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                position: "absolute",
                top: 10,
                right: 12,
                fontSize: 8,
                color: ACCENT2,
                fontWeight: 700,
                background: `${ACCENT2}18`,
                padding: "2px 8px",
                borderRadius: 6,
              }}
            >
              Preferred
            </motion.div>
          )}
        </div>

        {/* Response B */}
        <div style={{ ...glassCard, flex: 1 }}>
          <div
            style={{
              fontSize: 9,
              color: MUTED,
              fontWeight: 600,
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Response B
          </div>
          <div style={{ minHeight: 72 }}>
            {RESPONSE_B.slice(0, linesB).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: easeOut }}
                style={{ fontSize: 10, color: `${BONE}88`, lineHeight: 1.6 }}
              >
                {line}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Preference slider ── */}
      {phase >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
          style={{ marginTop: 16, padding: "0 4px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 9,
              color: MUTED,
              marginBottom: 6,
            }}
          >
            <span>A</span>
            <span style={{ fontSize: 8, color: `${BONE}60` }}>Preference</span>
            <span>B</span>
          </div>
          <div
            style={{
              position: "relative",
              height: 6,
              background: `${BONE}10`,
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <motion.div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT3})`,
                borderRadius: 3,
              }}
              animate={{ width: `${(1 - sliderPos) * 100}%` }}
              transition={{ duration: 0.8, ease: easeOut }}
            />
            <motion.div
              style={{
                position: "absolute",
                top: -3,
                width: 12,
                height: 12,
                borderRadius: 6,
                background: BONE,
                boxShadow: `0 0 8px ${ACCENT}60`,
              }}
              animate={{ left: `calc(${sliderPos * 100}% - 6px)` }}
              transition={{ duration: 0.8, ease: easeOut }}
            />
          </div>
        </motion.div>
      )}

      {/* ── Score badges ── */}
      {showScores && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          style={{
            display: "flex",
            gap: 10,
            marginTop: 16,
          }}
        >
          {SCORES.map((score, i) => (
            <motion.div
              key={score.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.15, ease: easeOut }}
              style={{
                ...glassCard,
                flex: 1,
                padding: "10px 12px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  color: MUTED,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 6,
                }}
              >
                {score.label}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: score.color }}>
                {score.value.toFixed(1)}
              </div>
              {/* Progress bar */}
              <div
                style={{
                  marginTop: 6,
                  height: 3,
                  background: `${BONE}10`,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(score.value / 10) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.15, ease: easeOut }}
                  style={{
                    height: "100%",
                    background: score.color,
                    borderRadius: 2,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── Quality score ring ── */}
      {showQuality && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: easeOut }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            marginTop: 16,
            ...glassCard,
            padding: "16px 24px",
          }}
        >
          {/* Circular ring */}
          <svg width={64} height={64} viewBox="0 0 64 64">
            <circle
              cx={32}
              cy={32}
              r={26}
              fill="none"
              stroke={`${BONE}10`}
              strokeWidth={4}
            />
            <motion.circle
              cx={32}
              cy={32}
              r={26}
              fill="none"
              stroke={ACCENT2}
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 26}
              initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
              animate={{
                strokeDashoffset:
                  2 * Math.PI * 26 * (1 - qualityProgress / 100),
              }}
              transition={{ duration: 1.2, ease: easeOut }}
              style={{
                transformOrigin: "center",
                transform: "rotate(-90deg)",
                filter: `drop-shadow(0 0 6px ${ACCENT2}60)`,
              }}
            />
            <text
              x={32}
              y={36}
              textAnchor="middle"
              fill={ACCENT2}
              fontSize={14}
              fontWeight={700}
              fontFamily="var(--font-mono, monospace)"
            >
              {qualityProgress}%
            </text>
          </svg>
          <div>
            <div
              style={{
                fontSize: 9,
                color: MUTED,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Overall Quality Score
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: ACCENT2, marginTop: 2 }}>
              {qualityProgress}%
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
