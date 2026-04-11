"use client";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { PulseDot } from "@/components/ui/pulse-dot";
import { primaryNav, secondaryNav } from "@/content/nav";
import { cn } from "@/lib/cn";

/** Glass top nav — transparent over hero, solid on scroll. */
export function Nav() {
  const { scrollY } = useScroll();
  const padding = useTransform(scrollY, [0, 200], ["1.25rem", "0.6rem"]);
  const blur = useTransform(scrollY, [0, 200], [8, 32]);
  const bg = useTransform(
    scrollY,
    [0, 200],
    ["rgba(10,10,12,0.2)", "rgba(10,10,12,0.55)"]
  );

  return (
    <motion.header
      style={{ backdropFilter: useBlur(blur), backgroundColor: bg }}
      className="fixed inset-x-0 top-0 z-50 border-b border-bone/8"
    >
      <motion.nav
        style={{ paddingBlock: padding }}
        className="container-wide flex items-center justify-between gap-4"
      >
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label="Home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-bone/16 font-serif text-lg">
            a
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/60">
              Adelusi
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/90">
              Dan Kunle
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 font-mono text-xs uppercase tracking-wider text-bone/70 transition-colors",
                "hover:text-bone hover:bg-bone/5"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-bone/12 bg-bone/5 px-3 py-1.5 md:flex">
            <PulseDot color="accent" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-bone/70">
              Building Live Self
            </span>
          </div>
          <Link
            href="/resume"
            className="hidden rounded-full bg-accent px-5 py-2 font-mono text-xs uppercase tracking-wider text-ink transition-all hover:-translate-y-[1px] md:inline-block"
          >
            Resume
          </Link>
          <Link
            href="/chat"
            className="inline-flex h-10 items-center justify-center rounded-full border border-bone/16 px-4 font-mono text-xs uppercase tracking-wider text-bone transition-all hover:border-accent hover:text-accent md:hidden"
          >
            Chat
          </Link>
        </div>
      </motion.nav>
    </motion.header>
  );
}

/** Convert a MotionValue<number> into a CSS backdrop-filter string. */
function useBlur(blur: ReturnType<typeof useTransform<number, number>>) {
  return useTransform(blur, (v) => `blur(${v}px) saturate(180%)`);
}
