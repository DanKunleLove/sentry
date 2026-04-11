"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

type Props = {
  text: string;
  className?: string;
  stagger?: number;
  delay?: number;
  /** Split into words (default) or characters. */
  by?: "word" | "char";
};

/** Editorial word-by-word (or char) hero reveal. SSR-safe. */
export function SplitText({
  text,
  className,
  stagger = 0.06,
  delay = 0.1,
  by = "word",
}: Props) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // SSR + first paint: render plain text. Hydration-safe regardless of motion preference.
  if (!mounted || reduced) {
    return <span className={className}>{text}</span>;
  }

  const items = by === "word" ? text.split(" ") : Array.from(text);

  return (
    <span className={className} aria-label={text}>
      {items.map((item, i) => (
        <span
          key={`${item}-${i}`}
          aria-hidden="true"
          className="inline-block overflow-hidden align-top"
        >
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{
              duration: 0.9,
              delay: delay + i * stagger,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {item}
            {by === "word" && i < items.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
