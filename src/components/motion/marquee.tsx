"use client";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

type Props = {
  items: React.ReactNode[];
  speed?: number;
  className?: string;
  itemClassName?: string;
  reverse?: boolean;
};

/** Infinite horizontal marquee — used for the tech strip under the hero. */
export function Marquee({
  items,
  speed = 40,
  className,
  itemClassName,
  reverse = false,
}: Props) {
  const reduced = useReducedMotion();
  const loop = [...items, ...items, ...items];

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        className
      )}
    >
      <motion.div
        className="flex w-max gap-12 whitespace-nowrap"
        animate={
          reduced
            ? undefined
            : { x: reverse ? ["-33.333%", "0%"] : ["0%", "-33.333%"] }
        }
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {loop.map((item, i) => (
          <span
            key={i}
            className={cn("flex shrink-0 items-center gap-3", itemClassName)}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
