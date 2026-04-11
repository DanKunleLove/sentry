import { cn } from "@/lib/cn";

export function Stat({
  value,
  label,
  className,
}: {
  value: React.ReactNode;
  label: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-2 border-l border-bone/12 pl-5",
        className
      )}
    >
      <div className="font-serif text-4xl leading-none tracking-tight md:text-5xl">
        {value}
      </div>
      <div className="font-mono text-xs uppercase tracking-widest text-bone/60">
        {label}
      </div>
    </div>
  );
}
