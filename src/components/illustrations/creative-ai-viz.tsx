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

/* ── Prompt text ───────────────────────────────────────── */
const PROMPT_TEXT = "Create a product video for the new AI agent dashboard with voiceover...";

/* ── Glass card base ───────────────────────────────────── */
const glassCard: React.CSSProperties = {
  background: `color-mix(in oklab, ${INK} 55%, transparent)`,
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  border: `1px solid color-mix(in oklab, ${BONE} 12%, transparent)`,
  borderRadius: 20,
  padding: "14px 16px",
};

/* ── Waveform bars (static heights for the fake waveform) ── */
const WAVEFORM_BARS = [
  0.3, 0.6, 0.8, 0.4, 0.9, 0.5, 0.7, 0.3, 0.85, 0.6, 0.45, 0.75, 0.5, 0.9,
  0.35, 0.65, 0.8, 0.4, 0.7, 0.55, 0.9, 0.3, 0.6, 0.85, 0.45, 0.7, 0.5,
  0.8, 0.6, 0.35,
];

/* ── Component ─────────────────────────────────────────── */
export function CreativeAIViz({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();

  const [charIdx, setCharIdx] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showCards, setShowCards] = useState([false, false, false]);
  const [bottomProgress, setBottomProgress] = useState(0);
  const [sparkle, setSparkle] = useState(false);
  const [waveformActive, setWaveformActive] = useState(false);

  useEffect(() => {
    if (!isInView || reduced) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const t = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };

    /* Phase 1 — type prompt (0 - 1.5s) */
    for (let i = 0; i <= PROMPT_TEXT.length; i++) {
      t(() => setCharIdx(i), i * 28);
    }
    const typeEnd = PROMPT_TEXT.length * 28;

    /* Phase 2 — processing spinner fill (1.5s - 3s) */
    t(() => setProcessingProgress(100), typeEnd + 200);

    /* Phase 3 — output cards appear one by one (3s - 4.2s) */
    t(() => setShowCards([true, false, false]), typeEnd + 800);
    t(() => setShowCards([true, true, false]), typeEnd + 1200);
    t(() => {
      setShowCards([true, true, true]);
      setWaveformActive(true);
    }, typeEnd + 1600);

    /* Phase 4 — bottom progress bar (3s - 4.5s) */
    t(() => setBottomProgress(100), typeEnd + 800);

    /* Phase 5 — sparkle on completion (4.5s) */
    t(() => setSparkle(true), typeEnd + 2200);
    t(() => setSparkle(false), typeEnd + 2800);

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
        maxWidth: "min(100%, 600px)",
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
        <span>Content Pipeline</span>
        <span style={{ color: sparkle ? ACCENT2 : bottomProgress >= 100 ? ACCENT : MUTED }}>
          {sparkle ? "Complete" : bottomProgress > 0 ? "Generating" : "Ready"}
        </span>
      </div>

      {/* ── 3-column layout ── */}
      <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
        {/* ── LEFT: Prompt input ── */}
        <div style={{ ...glassCard, flex: 1.1, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 9,
              color: ACCENT3,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 10,
            }}
          >
            Prompt
          </div>
          <div
            style={{
              flex: 1,
              fontSize: 11,
              color: `${BONE}cc`,
              lineHeight: 1.6,
              minHeight: 80,
            }}
          >
            {PROMPT_TEXT.slice(0, charIdx)}
            {charIdx < PROMPT_TEXT.length && (
              <motion.span
                style={{ color: ACCENT }}
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                |
              </motion.span>
            )}
          </div>
        </div>

        {/* ── CENTER: Processing indicator ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            flexShrink: 0,
          }}
        >
          <svg width={56} height={56} viewBox="0 0 56 56">
            {/* Track */}
            <circle
              cx={28}
              cy={28}
              r={22}
              fill="none"
              stroke={`${BONE}10`}
              strokeWidth={3}
            />
            {/* Progress ring */}
            <motion.circle
              cx={28}
              cy={28}
              r={22}
              fill="none"
              stroke={ACCENT}
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 22}
              initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
              animate={{
                strokeDashoffset:
                  2 * Math.PI * 22 * (1 - processingProgress / 100),
              }}
              transition={{ duration: 1.4, ease: easeOut }}
              style={{
                transformOrigin: "center",
                transform: "rotate(-90deg)",
                filter:
                  processingProgress >= 100
                    ? `drop-shadow(0 0 6px ${ACCENT}80)`
                    : undefined,
              }}
            />
            {/* Center icon / percentage */}
            <text
              x={28}
              y={32}
              textAnchor="middle"
              fill={processingProgress >= 100 ? ACCENT : MUTED}
              fontSize={12}
              fontWeight={700}
              fontFamily="var(--font-mono, monospace)"
            >
              {processingProgress >= 100 ? "\u2713" : "..."}
            </text>
          </svg>
          <div
            style={{
              fontSize: 8,
              color: MUTED,
              marginTop: 6,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {processingProgress >= 100 ? "Done" : "Processing"}
          </div>
          {/* Connecting arrows */}
          <svg width={56} height={16} viewBox="0 0 56 16" style={{ marginTop: -2 }}>
            <line
              x1={0}
              y1={8}
              x2={56}
              y2={8}
              stroke={`${BONE}15`}
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          </svg>
        </div>

        {/* ── RIGHT: Output cards ── */}
        <div
          style={{
            flex: 1.3,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {/* Card 1: Image */}
          {showCards[0] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: easeOut }}
              style={{ ...glassCard, padding: "10px 14px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Gradient placeholder */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT3})`,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: 10, color: BONE, fontWeight: 600 }}>Image</div>
                  <div style={{ fontSize: 8, color: MUTED, marginTop: 2 }}>1024\u00d71024</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Card 2: Video */}
          {showCards[1] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: easeOut }}
              style={{ ...glassCard, padding: "10px 14px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Video placeholder with play button */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: `linear-gradient(135deg, ${ACCENT2}40, ${ACCENT}40)`,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <svg width={16} height={16} viewBox="0 0 16 16">
                    <polygon points="5,3 13,8 5,13" fill={BONE} />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: BONE, fontWeight: 600 }}>Video</div>
                  <div style={{ fontSize: 8, color: MUTED, marginTop: 2 }}>
                    4K \u00b7 10s
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Card 3: Voice / Waveform */}
          {showCards[2] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: easeOut }}
              style={{ ...glassCard, padding: "10px 14px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontSize: 10, color: BONE, fontWeight: 600 }}>Voice</div>
                <div style={{ fontSize: 8, color: MUTED }}>ElevenLabs</div>
              </div>
              {/* Audio waveform */}
              <svg
                width="100%"
                height={24}
                viewBox={`0 0 ${WAVEFORM_BARS.length * 6} 24`}
                preserveAspectRatio="none"
              >
                {WAVEFORM_BARS.map((h, i) => (
                  <motion.rect
                    key={i}
                    x={i * 6}
                    width={3}
                    rx={1.5}
                    fill={ACCENT3}
                    initial={{ y: 12, height: 1 }}
                    animate={
                      waveformActive
                        ? {
                            y: 12 - h * 10,
                            height: h * 20,
                            opacity: [0.5, 1, 0.5],
                          }
                        : {}
                    }
                    transition={
                      waveformActive
                        ? {
                            y: {
                              duration: 0.4,
                              delay: i * 0.02,
                              ease: easeOut,
                            },
                            height: {
                              duration: 0.4,
                              delay: i * 0.02,
                              ease: easeOut,
                            },
                            opacity: {
                              duration: 1.2,
                              delay: i * 0.04,
                              repeat: Infinity,
                              repeatType: "reverse" as const,
                            },
                          }
                        : {}
                    }
                  />
                ))}
              </svg>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Bottom progress bar ── */}
      <div
        style={{
          marginTop: 16,
          position: "relative",
          height: 4,
          background: `${BONE}08`,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <motion.div
          style={{
            height: "100%",
            background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`,
            borderRadius: 2,
          }}
          initial={{ width: "0%" }}
          animate={{ width: `${bottomProgress}%` }}
          transition={{ duration: 2.0, ease: easeOut }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 6,
          fontSize: 9,
          color: MUTED,
        }}
      >
        <span>0%</span>
        <span>100%</span>
      </div>

      {/* ── Sparkle overlay ── */}
      {sparkle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.6 }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 20,
            background: `radial-gradient(ellipse at center, ${ACCENT2}20 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
