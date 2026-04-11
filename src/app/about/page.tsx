import type { Metadata } from "next";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { ExperienceTimeline } from "@/components/sections/experience-timeline";
import { bio, hero } from "@/content/about";
import { skillGroups } from "@/content/skills";
import { education } from "@/content/experience";

export const metadata: Metadata = {
  title: "About — Adelusi Dan Kunle",
  description:
    "Physics-trained AI engineer shipping production LLM products, automation systems, and creative-AI pipelines for international clients.",
};

export default function AboutPage() {
  return (
    <>
      <SmoothScroll />
      <Nav />
      <main id="main" className="pt-48">
        <Container>
          <Reveal>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/50">
              About
            </p>
            <h1 className="display-lg mb-16 max-w-4xl">{bio.headline}</h1>
          </Reveal>

          <div className="grid gap-16 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-6 text-lg leading-relaxed text-bone/80">
              {bio.paragraphs.map((p, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <p>{p}</p>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.2}>
              <div className="glass p-8">
                <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/50">
                  At a glance
                </p>
                <dl className="space-y-5 text-sm">
                  <Row label="Based in" value={hero.location} />
                  <Row label="Primary" value={hero.roles.join(" · ")} />
                  <Row label="Languages" value="English" />
                  <Row
                    label="Available"
                    value="Freelance · Contract · Remote FT · Advisory"
                  />
                  <Row label="Education" value="Physics & CS (FUOYE)" />
                </dl>
              </div>
            </Reveal>
          </div>
        </Container>

        <ExperienceTimeline />

        <section className="section-y">
          <Container>
            <Reveal>
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/50">
                Skills
              </p>
              <h2 className="display-md mb-16 max-w-2xl">
                The toolkit, grouped.
              </h2>
            </Reveal>
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
              {skillGroups.map((g, i) => (
                <Reveal key={g.name} delay={i * 0.05}>
                  <div>
                    <p className="mb-4 font-mono text-[10px] uppercase tracking-wider text-accent">
                      {g.name}
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {g.skills.map((s) => (
                        <li
                          key={s}
                          className="rounded-full border border-bone/12 bg-bone/4 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-bone/75"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        <section className="section-y">
          <Container>
            <Reveal>
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/50">
                Education
              </p>
            </Reveal>
            <div className="space-y-10">
              {education.map((e, i) => (
                <Reveal key={e.institution} delay={i * 0.06}>
                  <div className="grid gap-4 border-t border-bone/10 pt-8 md:grid-cols-[auto_1fr] md:gap-16">
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
                        {e.degree}
                      </h3>
                      <p className="mt-1 font-mono text-xs uppercase tracking-wider text-accent">
                        {e.institution}
                      </p>
                      {e.gpa && (
                        <p className="mt-3 font-mono text-xs uppercase tracking-wider text-bone/60">
                          {e.gpa}
                        </p>
                      )}
                      <ul className="mt-5 space-y-2">
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
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-bone/8 pb-3 last:border-0">
      <dt className="font-mono text-[10px] uppercase tracking-wider text-bone/50">
        {label}
      </dt>
      <dd className="text-right text-bone/90">{value}</dd>
    </div>
  );
}
