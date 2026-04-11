"use client";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { GradientMesh } from "@/components/motion/gradient-mesh";
import { SplitText } from "@/components/motion/split-text";
import { RotatingTagline } from "@/components/motion/rotating-tagline";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { hero, taglines } from "@/content/about";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-32">
      <GradientMesh />

      <Container className="relative z-10">
        <div className="grid items-end gap-16 md:grid-cols-[minmax(0,1fr)_auto] md:gap-24">
          <div>
            <p className="mb-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/60">
              <span className="inline-block h-px w-10 bg-accent" />
              {hero.roles.join(" · ")}
            </p>

            <h1 className="display-xl leading-[0.92]">
              <SplitText text="Adelusi" className="block" delay={0.1} />
              <SplitText text="Dan Kunle." className="block" delay={0.3} />
            </h1>

            <p className="mt-10 max-w-xl text-lg leading-relaxed text-bone/75 md:text-xl">
              {hero.lede}
            </p>

            <Reveal delay={0.6}>
              <p className="mt-6 font-mono text-xs uppercase tracking-wider text-accent">
                <RotatingTagline taglines={taglines} />
              </p>
            </Reveal>

            <Reveal delay={0.8} className="mt-10 flex flex-wrap gap-4">
              <Magnetic>
                <ButtonLink href="#work" variant="primary" size="lg">
                  See the work ↓
                </ButtonLink>
              </Magnetic>
              <Magnetic>
                <ButtonLink href="/chat" variant="glass" size="lg">
                  Ask my AI twin
                </ButtonLink>
              </Magnetic>
            </Reveal>
          </div>

          <Reveal delay={0.4} className="hidden md:block">
            <PortraitCard />
          </Reveal>
        </div>

        <div className="mt-24 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/50">
          <span className="inline-block h-px w-8 bg-bone/30" />
          {hero.location}
        </div>
      </Container>
    </section>
  );
}

function PortraitCard() {
  return (
    <div className="glass relative flex h-[420px] w-[280px] flex-col justify-end overflow-hidden p-5">
      {/* Graceful gradient fallback — slots the real image in once /images/adk-portrait.webp exists */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 30%, rgba(255,91,31,0.35) 0%, rgba(255,91,31,0.08) 35%, rgba(10,10,12,1) 75%)",
        }}
      />
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center grayscale-[0.1]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(10,10,12,0) 0%, rgba(10,10,12,0.85) 100%), url('/images/adk-portrait.webp')",
        }}
      />
      <div className="flex flex-col gap-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/70">
          Adelusi Dan Kunle
        </p>
        <p className="font-serif text-xl leading-tight">
          Available globally.
        </p>
        <Link
          href="/about"
          className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-accent"
        >
          More about me →
        </Link>
      </div>
    </div>
  );
}
