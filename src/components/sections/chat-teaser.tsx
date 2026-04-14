import Link from "next/link";
import { Container } from "@/components/layout/container";
import { GlassCard } from "@/components/ui/glass-card";
import { PulseDot } from "@/components/ui/pulse-dot";
import { GradientMesh } from "@/components/motion/gradient-mesh";
import { Reveal } from "@/components/motion/reveal";

export function ChatTeaser() {
  return (
    <section className="section-y relative overflow-hidden">
      <GradientMesh intensity={0.7} />
      <Container className="relative z-10">
        <Reveal>
          <GlassCard variant="strong" className="p-8 md:p-20">
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="mb-4 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/60">
                  <PulseDot color="accent" />
                  Live · grounded on the real résumé
                </p>
                <h2 className="display-md leading-[0.95]">
                  Ask my AI twin
                  <br />
                  anything.
                </h2>
                <p className="mt-6 text-lg text-bone/70">
                  Built on Gemini, grounded on my projects and experience. Ask about
                  Phantm, Mocha Property, my automation pipelines, timelines,
                  availability — whatever you need to know.
                </p>
              </div>
              <Link
                href="/chat"
                className="group inline-flex h-12 items-center justify-center gap-3 rounded-full bg-accent px-8 font-mono text-xs uppercase tracking-wider text-ink transition-all hover:-translate-y-[2px] md:h-16 md:px-10"
              >
                Start chat
                <span className="text-lg transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </GlassCard>
        </Reveal>
      </Container>
    </section>
  );
}
