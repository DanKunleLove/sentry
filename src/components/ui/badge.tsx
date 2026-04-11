import * as React from "react";
import { cn } from "@/lib/cn";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "accent" | "glass";
};

export function Badge({
  className,
  tone = "default",
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs uppercase tracking-wider",
        tone === "default" &&
          "border border-bone/12 bg-bone/4 text-bone/80",
        tone === "accent" && "bg-accent text-ink",
        tone === "glass" && "glass-light text-bone/90",
        className
      )}
      {...rest}
    />
  );
}
