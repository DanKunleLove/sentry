import { cn } from "@/lib/cn";

/** Max-width wrapper with responsive padding. */
export function Container({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("container-wide", className)} {...rest}>
      {children}
    </div>
  );
}
