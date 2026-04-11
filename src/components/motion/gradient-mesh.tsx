"use client";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

/**
 * Slowly drifting radial gradient mesh — sits behind hero + chat + command palette.
 * Pure CSS blobs animated with Framer Motion for buttery-smooth compositing.
 */
export function GradientMesh({
  className,
  intensity = 1,
}: {
  className?: string;
  intensity?: number;
}) {
  const reduced = useReducedMotion();

  const o = 0.28 * intensity;
  const o2 = 0.18 * intensity;
  const o3 = 0.12 * intensity;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className
      )}
    >
      <motion.div
        className="absolute -top-32 -left-16 h-[70vmin] w-[70vmin] rounded-full blur-3xl"
        style={{ backgroundColor: `rgba(255, 91, 31, ${o})` }}
        animate={
          reduced
            ? undefined
            : {
                x: [0, 60, -40, 0],
                y: [0, 40, -20, 0],
              }
        }
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/3 right-0 h-[60vmin] w-[60vmin] rounded-full blur-3xl"
        style={{ backgroundColor: `rgba(142, 197, 255, ${o2})` }}
        animate={
          reduced
            ? undefined
            : {
                x: [0, -50, 30, 0],
                y: [0, 60, 20, 0],
              }
        }
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-[55vmin] w-[55vmin] rounded-full blur-3xl"
        style={{ backgroundColor: `rgba(212, 255, 0, ${o3})` }}
        animate={
          reduced
            ? undefined
            : {
                x: [0, 40, -20, 0],
                y: [0, -30, 40, 0],
              }
        }
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
