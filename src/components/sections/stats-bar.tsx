import { Container } from "@/components/layout/container";
import { Stat } from "@/components/ui/stat";
import { Reveal } from "@/components/motion/reveal";
import { stats } from "@/content/about";

export function StatsBar() {
  return (
    <section className="section-y">
      <Container>
        <Reveal>
          <p className="mb-10 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/50">
            By the numbers
          </p>
        </Reveal>
        <div className="grid grid-cols-2 gap-y-10 md:grid-cols-5">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <Stat value={s.value} label={s.label} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
