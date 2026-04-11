"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ElementType, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "article" | "span" | "li";
  once?: boolean;
};

/** In-view fade/slide reveal. Respects prefers-reduced-motion and is SSR-safe. */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = "div",
  once = true,
}: Props) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // SSR + first paint: render a plain element identical to the server output.
  // This guarantees no hydration mismatch from framer-motion's initial styles.
  if (!mounted || reduced) {
    const Tag = as as ElementType;
    return <Tag className={className}>{children}</Tag>;
  }

  const Element = motion[as] as typeof motion.div;
  return (
    <Element
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.3 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </Element>
  );
}
