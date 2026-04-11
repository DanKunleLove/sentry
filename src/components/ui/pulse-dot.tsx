import { cn } from "@/lib/cn";

/** Small pulsing indicator used in nav / "currently building" badges. */
export function PulseDot({
  className,
  color = "accent",
}: {
  className?: string;
  color?: "accent" | "green" | "blue";
}) {
  const bg =
    color === "green"
      ? "bg-emerald-400"
      : color === "blue"
      ? "bg-accent-3"
      : "bg-accent";
  return (
    <span
      className={cn("relative inline-flex h-2.5 w-2.5", className)}
      aria-hidden="true"
    >
      <span
        className={cn(
          "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
          bg
        )}
      />
      <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", bg)} />
    </span>
  );
}
