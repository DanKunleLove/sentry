import { Container } from "@/components/layout/container";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/motion/reveal";
import { engagementTypes } from "@/content/services";

export function EngagementTypes() {
  return (
    <section className="section-y">
      <Container>
        <Reveal>
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/50">
            Engagement types
          </p>
          <h2 className="display-md mb-4 max-w-2xl">
            Pick the shape that fits your org.
          </h2>
          <p className="mb-10 max-w-xl text-bone/60 md:mb-16">
            Freelance sprints, long-term contracts, remote full-time, advisory,
            or AI training — I take work in all these shapes.
          </p>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {engagementTypes.map((e, i) => (
            <Reveal key={e.id} delay={i * 0.06}>
              <GlassCard className="flex h-full flex-col gap-3 p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
                  0{i + 1}
                </p>
                <h3 className="font-serif text-2xl leading-tight">
                  {e.label}
                </h3>
                <p className="text-sm leading-relaxed text-bone/70">
                  {e.blurb}
                </p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
