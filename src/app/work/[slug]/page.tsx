import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientMesh } from "@/components/motion/gradient-mesh";
import { allWorks } from "@/content/works";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return allWorks.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const work = allWorks.find((w) => w.slug === slug);
  if (!work) return {};
  return {
    title: `${work.title} — ${work.tagline} · Case Study`,
    description: work.summary,
    openGraph: {
      title: `${work.title} — ${work.tagline}`,
      description: work.summary,
      type: "article",
    },
  };
}

export default async function CaseStudy(props: { params: Params }) {
  const { slug } = await props.params;
  const work = allWorks.find((w) => w.slug === slug);
  if (!work) notFound();

  const index = allWorks.indexOf(work);
  const prev = allWorks[index - 1];
  const next = allWorks[index + 1];

  return (
    <>
      <SmoothScroll />
      <Nav />
      <main id="main" className="pt-36">
        <section className="relative overflow-hidden pb-20">
          <GradientMesh intensity={0.5} />
          <Container className="relative z-10">
            <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/50">
              <Link href="/work" className="hover:text-accent">
                /work
              </Link>{" "}
              · {work.slug}
            </p>

            <Reveal>
              <h1 className="display-lg mb-4 max-w-4xl">{work.title}</h1>
              <p className="mb-8 max-w-3xl text-xl text-bone/70 md:text-2xl">
                {work.tagline}
              </p>
              <div className="flex flex-wrap gap-6 font-mono text-[10px] uppercase tracking-wider text-bone/50">
                <span>{work.year}</span>
                <span>·</span>
                <span>{work.client ?? "Independent"}</span>
                <span>·</span>
                <span>{work.role}</span>
                <span>·</span>
                <span>{work.status}</span>
              </div>
            </Reveal>

            {work.metrics && work.metrics.length > 0 && (
              <Reveal delay={0.2}>
                <GlassCard className="mt-12 flex flex-wrap gap-8 p-8 md:gap-16">
                  {work.metrics.map((m) => (
                    <div key={m.label}>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-bone/50">
                        {m.label}
                      </p>
                      <p className="mt-2 font-serif text-4xl leading-none text-accent">
                        {m.value}
                      </p>
                    </div>
                  ))}
                </GlassCard>
              </Reveal>
            )}
          </Container>
        </section>

        <Container>
          <article className="mx-auto max-w-3xl space-y-16">
            <Reveal>
              <Section title="Approach">
                <p className="text-lg leading-relaxed text-bone/80">
                  {work.reasoning}
                </p>
              </Section>
            </Reveal>

            <Reveal>
              <Section title="Problem">
                <p className="text-lg leading-relaxed text-bone/80">
                  {work.problem}
                </p>
              </Section>
            </Reveal>

            <Reveal>
              <Section title="How I built it">
                <ul className="space-y-4">
                  {work.approach.map((a) => (
                    <li
                      key={a}
                      className="flex gap-4 text-lg leading-relaxed text-bone/80"
                    >
                      <span className="text-accent">▸</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            </Reveal>

            <Reveal>
              <Section title="Outcome">
                <ul className="space-y-4">
                  {work.outcome.map((o) => (
                    <li
                      key={o}
                      className="flex gap-4 text-lg leading-relaxed text-bone/80"
                    >
                      <span className="text-accent">→</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            </Reveal>

            <Reveal>
              <Section title="Stack">
                <div className="flex flex-wrap gap-2">
                  {work.stack.map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
              </Section>
            </Reveal>

            {work.links && work.links.length > 0 && (
              <Reveal>
                <Section title="Links">
                  <ul className="space-y-2">
                    {work.links.map((l) => (
                      <li key={l.href}>
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-sm uppercase tracking-wider text-accent hover:underline"
                        >
                          {l.label} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                </Section>
              </Reveal>
            )}
          </article>
        </Container>

        <Container className="mt-32 flex flex-col gap-4 border-t border-bone/10 py-16 md:flex-row md:items-center md:justify-between">
          {prev ? (
            <Link
              href={`/work/${prev.slug}`}
              className="font-mono text-xs uppercase tracking-wider text-bone/60 hover:text-accent"
            >
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          <Link
            href="/work"
            className="font-mono text-xs uppercase tracking-wider text-bone/60 hover:text-accent"
          >
            All work
          </Link>
          {next ? (
            <Link
              href={`/work/${next.slug}`}
              className="font-mono text-xs uppercase tracking-wider text-bone/60 hover:text-accent"
            >
              {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
        {title}
      </p>
      {children}
    </div>
  );
}
