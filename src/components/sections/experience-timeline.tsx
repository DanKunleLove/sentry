import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { experience } from "@/content/experience";

export function ExperienceTimeline() {
  return (
    <section className="section-y">
      <Container>
        <Reveal>
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/50">
            Experience
          </p>
          <h2 className="display-md mb-10 max-w-2xl md:mb-16">
            The work so far.
          </h2>
        </Reveal>

        <ol className="flex flex-col gap-10 md:gap-16">
          {experience.map((e, i) => (
            <Reveal key={e.company + e.role} delay={i * 0.08}>
              <li className="grid gap-6 border-t border-bone/10 pt-10 md:grid-cols-[auto_1fr] md:gap-16">
                <div className="md:w-[200px]">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-bone/50">
                    {e.start} — {e.end}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-bone/40">
                    {e.location}
                  </p>
                </div>
                <div>
                  <h3 className="font-serif text-2xl leading-tight md:text-3xl">
                    {e.role}
                  </h3>
                  <p className="mt-1 font-mono text-xs uppercase tracking-wider text-accent">
                    {e.company}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {e.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex gap-3 text-bone/75 leading-relaxed"
                      >
                        <span className="text-accent">▸</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
