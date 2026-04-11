"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  taglines: string[];
  interval?: number;
  className?: string;
};

/** Cross-fading tagline rotator used under the hero name. */
export function RotatingTagline({ taglines, interval = 4000, className }: Props) {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setI((v) => (v + 1) % taglines.length), interval);
    return () => clearInterval(t);
  }, [taglines.length, interval, reduced]);

  if (reduced) {
    return <span className={className}>{taglines[0]}</span>;
  }

  return (
    <span className={cn("relative inline-block", className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={taglines[i]}
          className="inline-block"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {taglines[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
