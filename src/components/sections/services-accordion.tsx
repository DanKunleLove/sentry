"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { services } from "@/content/services";
import { cn } from "@/lib/cn";

export function ServicesAccordion({ hideHeading = false }: { hideHeading?: boolean } = {}) {
  const [open, setOpen] = useState<string | null>(services[0]?.id ?? null);

  return (
    <section id="services" className="section-y">
      <Container>
        {!hideHeading && (
          <Reveal>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/50">
              Services
            </p>
            <h2 className="display-md mb-16 max-w-2xl">
              Five lanes. One operator.
            </h2>
          </Reveal>
        )}

        <ul className="flex flex-col divide-y divide-bone/10 border-y border-bone/10">
          {services.map((s) => {
            const isOpen = open === s.id;
            return (
              <li key={s.id}>
                <button
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-6 py-8 text-left transition-colors",
                    "hover:text-accent"
                  )}
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-6">
                    <span className="font-mono text-xs uppercase tracking-wider text-bone/40">
                      0{services.indexOf(s) + 1}
                    </span>
                    <h3 className="font-serif text-2xl tracking-tight md:text-4xl">
                      {s.title}
                    </h3>
                  </div>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="text-3xl text-bone/50"
                  >
                    +
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-8 pb-10 md:grid-cols-[1.3fr_1fr] md:gap-16">
                        <p className="text-lg leading-relaxed text-bone/70">
                          {s.lede}
                        </p>
                        <div>
                          <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-bone/50">
                            Deliverables
                          </p>
                          <ul className="space-y-2 text-bone/75">
                            {s.deliverables.map((d) => (
                              <li key={d} className="flex gap-3">
                                <span className="text-accent">→</span>
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="mt-6 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-wider text-bone/50">
                            {s.stack.map((st) => (
                              <span
                                key={st}
                                className="rounded-full border border-bone/12 px-2.5 py-1"
                              >
                                {st}
                              </span>
                            ))}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
