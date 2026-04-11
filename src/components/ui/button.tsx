import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "glass" | "link";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-300 ease-out select-none disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-ink hover:bg-accent/90 shadow-[0_12px_30px_-12px_rgba(255,91,31,0.6)]",
  ghost:
    "bg-transparent text-bone border border-bone/12 hover:border-bone/28 hover:bg-bone/4",
  glass:
    "glass-strong text-bone hover:-translate-y-[2px]",
  link: "text-bone underline-offset-4 hover:underline p-0",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm rounded-full",
  md: "h-12 px-6 text-base rounded-full",
  lg: "h-14 px-8 text-lg rounded-full",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

type ButtonLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant;
  size?: Size;
};

export const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  function ButtonLink(
    { className, variant = "primary", size = "md", ...props },
    ref
  ) {
    return (
      <a
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
