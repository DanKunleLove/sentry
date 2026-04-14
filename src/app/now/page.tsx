import type { Metadata } from "next";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { GlassCard } from "@/components/ui/glass-card";
import { PulseDot } from "@/components/ui/pulse-dot";
import { fetchNowItems, type NowItem } from "@/lib/notion";

/** Revalidate every 6 hours so Notion edits go live automatically. */
export const revalidate = 21600;

export const metadata: Metadata = {
  title: "Now — What I'm Building",
  description:
    "Currently building, currently learning, currently shipping. A live snapshot of Dan's work this week.",
};

/* ── Hardcoded fallback if Notion is unavailable ── */
const fallbackBuilding = [
  { title: "LiveSelf", description: "Persistent digital-self platform. Voice cloning + tone-adaptive responses + human-in-the-loop escalation.", status: "Architecture phase", type: "building" as const, order: 1 },
  { title: "TELOS", description: "AI freelance-success platform — career optimisation via AI job matching, analytics, and coaching.", status: "Architecture", type: "building" as const, order: 2 },
  { title: "Sentry (this site)", description: "The portfolio itself. Built as an AI product so it closes leads on my behalf.", status: "Live iteration", type: "building" as const, order: 3 },
];
const fallbackLearning = [
  { title: "Cache Components in Next.js 16", type: "learning" as const, order: 1 },
  { title: "Multi-agent orchestration patterns", type: "learning" as const, order: 2 },
  { title: "Voice-first product UX", type: "learning" as const, order: 3 },
  { title: "LiveKit + Cartesia for sub-500ms voice loops", type: "learning" as const, order: 4 },
];

export default async function NowPage() {
  const items = await fetchNowItems();
  const hasNotion = items.length > 0;

  const building: NowItem[] = hasNotion
    ? items.filter((i) => i.type === "building")
    : fallbackBuilding;

  const learning: NowItem[] = hasNotion
    ? items.filter((i) => i.type === "learning")
    : fallbackLearning;

  return (
    <>
      <SmoothScroll />
      <Nav />
      <main id="main" className="pt-48">
        <Container>
          <Reveal>
            <p className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/50">
              <PulseDot />
              Now {hasNotion ? "· synced from Notion" : "· updated April 2026"}
            </p>
            <h1 className="display-lg mb-16 max-w-4xl">
              What I&rsquo;m building right now.
            </h1>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-3">
            {building.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.08}>
                <GlassCard className="h-full p-8">
                  {b.status && (
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-accent">
                      {b.status}
                    </p>
                  )}
                  <h3 className="font-serif text-3xl leading-tight">
                    {b.title}
                  </h3>
                  {b.description && (
                    <p className="mt-4 text-bone/70 leading-relaxed">
                      {b.description}
                    </p>
                  )}
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
                    key={l.title}
                    className="flex gap-4 text-lg text-bone/80"
                  >
                    <span className="text-accent">▸</span>
                    {l.title}
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
