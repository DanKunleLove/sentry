import type { Metadata } from "next";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { GlassCard } from "@/components/ui/glass-card";
import { PulseDot } from "@/components/ui/pulse-dot";

export const metadata: Metadata = {
  title: "Now — What I'm Building",
  description:
    "Currently building, currently learning, currently shipping. A live snapshot of Dan's work this week.",
};

const building = [
  {
    title: "LiveSelf",
    blurb:
      "Persistent digital-self platform. Voice cloning + tone-adaptive responses + human-in-the-loop escalation.",
    status: "Architecture phase",
  },
  {
    title: "TELOS",
    blurb:
      "AI freelance-success platform — submitted to Red Bull Basement 2026. Now scoping the Q3 build.",
    status: "Scoping",
  },
  {
    title: "Sentry (this site)",
    blurb:
      "The portfolio itself. Built as an AI product so it closes leads on my behalf.",
    status: "Live iteration",
  },
];

const learning = [
  "Cache Components in Next.js 16",
  "Multi-agent orchestration patterns",
  "Voice-first product UX",
  "LiveKit + Cartesia for sub-500ms voice loops",
];

export default function NowPage() {
  return (
    <>
      <SmoothScroll />
      <Nav />
      <main id="main" className="pt-48">
        <Container>
          <Reveal>
            <p className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/50">
              <PulseDot />
              Now · updated April 2026
            </p>
            <h1 className="display-lg mb-16 max-w-4xl">
              What I&rsquo;m building right now.
            </h1>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-3">
            {building.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.08}>
                <GlassCard className="h-full p-8">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-accent">
                    {b.status}
                  </p>
                  <h3 className="font-serif text-3xl leading-tight">
                    {b.title}
                  </h3>
                  <p className="mt-4 text-bone/70 leading-relaxed">
                    {b.blurb}
                  </p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </Container>

        <section className="section-y">
          <Container>
            <Reveal>
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/50">
                Currently learning
              </p>
              <h2 className="display-md mb-10 max-w-2xl">
                The stack moves fast. So do I.
              </h2>
              <ul className="space-y-4">
                {learning.map((l) => (
                  <li
                    key={l}
                    className="flex gap-4 text-lg text-bone/80"
                  >
                    <span className="text-accent">▸</span>
                    {l}
                  </li>
                ))}
              </ul>
            </Reveal>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
