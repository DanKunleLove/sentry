import * as React from "react";
import { cn } from "@/lib/cn";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "strong" | "light";
};

/** Liquid-glass surface — iOS 26 inspired. */
export const GlassCard = React.forwardRef<HTMLDivElement, Props>(
  function GlassCard({ className, variant = "default", ...rest }, ref) {
    const variantClass =
      variant === "strong"
        ? "glass-strong"
        : variant === "light"
        ? "glass-light"
        : "glass";
    return <div ref={ref} className={cn(variantClass, className)} {...rest} />;
  }
);
