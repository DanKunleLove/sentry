import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { allWorks } from "@/content/works";

export const metadata: Metadata = {
  title: "Selected Work · AI Products, Automation & Creative-AI",
  description:
    "Production projects across LLM products, voice agents, automation, full-stack AI, and creative-AI — shipped for clients across multiple countries.",
};

export default function WorkIndex() {
  return (
    <>
      <SmoothScroll />
      <Nav />
      <main id="main" className="pt-48">
        <Container>
          <Reveal>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/50">
              The work
            </p>
            <h1 className="display-lg mb-16 max-w-3xl">
              Selected projects. Multiple countries. One operator.
            </h1>
          </Reveal>

          <ul className="flex flex-col divide-y divide-bone/10 border-y border-bone/10">
            {allWorks.map((w, i) => (
              <Reveal key={w.slug} delay={i * 0.04} as="li">
                <Link
                  href={`/work/${w.slug}`}
                  className="group grid gap-4 py-10 transition-colors hover:text-accent md:grid-cols-[auto_1fr_auto] md:items-center md:gap-12"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone/40">
                    0{i + 1}
                  </span>
                  <div>
                    <h2 className="font-serif text-3xl leading-tight md:text-5xl">
                      {w.title}
                    </h2>
                    <p className="mt-2 text-bone/65 md:text-lg">{w.tagline}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {w.stack.slice(0, 5).map((s) => (
                        <Badge key={s}>{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:justify-start">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-bone/50">
                      {w.year} · {w.status}
                    </span>
                    <span className="text-2xl text-bone/30 transition-transform group-hover:translate-x-1 group-hover:text-accent">
                      →
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </Container>
      </main>
      <Footer />
    </>
  );
}
