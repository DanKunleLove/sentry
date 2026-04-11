import { cn } from "@/lib/cn";

type Props = React.HTMLAttributes<HTMLElement> & {
  as?: "section" | "article" | "div";
};

/** Semantic section with consistent vertical rhythm. */
export function Section({
  as = "section",
  className,
  children,
  ...rest
}: Props) {
  const Component = as as "section";
  return (
    <Component className={cn("section-y relative", className)} {...rest}>
      {children}
    </Component>
  );
}
