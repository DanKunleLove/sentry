"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { PulseDot } from "@/components/ui/pulse-dot";
import { primaryNav, secondaryNav } from "@/content/nav";
import { cn } from "@/lib/cn";

/** Glass top nav — transparent over hero, solid on scroll. Mobile drawer included. */
export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const padding = useTransform(scrollY, [0, 200], ["1.25rem", "0.6rem"]);
  const blur = useTransform(scrollY, [0, 200], [8, 32]);
  const bg = useTransform(
    scrollY,
    [0, 200],
    ["rgba(10,10,12,0.2)", "rgba(10,10,12,0.55)"]
  );

  return (
    <>
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

          {/* Desktop nav */}
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
                Available for work
              </span>
            </div>
            <Link
              href="/resume"
              className="hidden rounded-full bg-accent px-5 py-2 font-mono text-xs uppercase tracking-wider text-ink transition-all hover:-translate-y-[1px] md:inline-block"
            >
              Resume
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-bone/16 transition-colors hover:border-accent md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <span className="flex flex-col gap-[5px]">
                <span
                  className={cn(
                    "block h-[1.5px] w-4 bg-bone transition-all duration-300",
                    mobileOpen && "translate-y-[3.25px] rotate-45"
                  )}
                />
                <span
                  className={cn(
                    "block h-[1.5px] w-4 bg-bone transition-all duration-300",
                    mobileOpen && "-translate-y-[3.25px] -rotate-45"
                  )}
                />
              </span>
            </button>
          </div>
        </motion.nav>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="glass-strong absolute inset-x-4 top-20 flex flex-col gap-2 p-6"
            >
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl px-4 py-3 font-serif text-2xl text-bone transition-colors hover:bg-bone/5 hover:text-accent"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-4 border-t border-bone/10 pt-4">
                <div className="flex gap-3">
                  <Link
                    href="/chat"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 rounded-full border border-bone/16 py-3 text-center font-mono text-xs uppercase tracking-wider text-bone transition-colors hover:border-accent hover:text-accent"
                  >
                    AI Twin
                  </Link>
                  <Link
                    href="/resume"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 rounded-full bg-accent py-3 text-center font-mono text-xs uppercase tracking-wider text-ink transition-all hover:-translate-y-[1px]"
                  >
                    Resume
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Convert a MotionValue<number> into a CSS backdrop-filter string. */
function useBlur(blur: ReturnType<typeof useTransform<number, number>>) {
  return useTransform(blur, (v) => `blur(${v}px) saturate(180%)`);
}
