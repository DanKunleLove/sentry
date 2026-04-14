"use client";
import Image from "next/image";
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
        <div className="grid items-end gap-12 md:grid-cols-[minmax(0,1fr)_auto] md:gap-24">
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
                  Ask my AI agent
                </ButtonLink>
              </Magnetic>
            </Reveal>
          </div>

          {/* Desktop portrait — right column */}
          <Reveal delay={0.4} className="hidden md:block">
            <PortraitCard />
          </Reveal>
        </div>

        <div className="mt-12 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/50 md:mt-24">
          <span className="inline-block h-px w-8 bg-bone/30" />
          {hero.location}
        </div>
      </Container>
    </section>
  );
}

function PortraitCard() {
  return (
    <div className="relative flex h-[460px] w-[300px] flex-col justify-end overflow-hidden rounded-[28px] border border-bone/10">
      <Image
        src="/images/adk-portrait.png"
        alt="Adelusi Dan Kunle — AI Engineer"
        fill
        sizes="300px"
        priority
        className="object-cover object-top"
      />
      {/* Subtle bottom scrim for text readability only */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[100px] bg-gradient-to-t from-ink/70 to-transparent"
      />
      <div className="relative z-10 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/80">
          Adelusi Dan Kunle
        </p>
        <p className="font-serif text-xl leading-tight text-bone">
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
