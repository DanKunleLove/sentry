import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { featuredWorks } from "@/content/works";

export function FeaturedWorks() {
  return (
    <section id="work" className="section-y">
      <Container>
        <div className="mb-20 flex items-end justify-between">
          <div>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/50">
              Selected work
            </p>
            <h2 className="display-md max-w-xl">
              Products built. Clients paid. Four countries.
            </h2>
          </div>
          <Link
            href="/work"
            className="hidden font-mono text-xs uppercase tracking-wider text-bone/60 hover:text-accent md:block"
          >
            View all →
          </Link>
        </div>

        <ul className="flex flex-col gap-6">
          {featuredWorks.map((w, i) => (
            <Reveal key={w.slug} delay={i * 0.05}>
              <Link
                href={`/work/${w.slug}`}
                className="group relative flex flex-col gap-6 overflow-hidden rounded-[28px] border border-bone/10 bg-ink-2 p-8 transition-all duration-500 hover:border-accent/40 md:flex-row md:items-center md:justify-between md:p-10"
              >
                <div className="flex items-start gap-6 md:items-center">
                  <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-bone/40">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="font-serif text-3xl leading-tight tracking-tight md:text-5xl">
                      {w.title}
                    </h3>
                    <p className="mt-2 max-w-xl text-bone/65 md:text-lg">
                      {w.tagline}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {w.stack.slice(0, 4).map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                      {w.stack.length > 4 && (
                        <Badge>+{w.stack.length - 4}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden flex-col items-end gap-1 md:flex">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-bone/40">
                      {w.year} · {w.role}
                    </span>
                    {w.metrics?.[0] && (
                      <span className="font-serif text-2xl text-accent">
                        {w.metrics[0].value}
                      </span>
                    )}
                  </div>
                  <span className="text-4xl text-bone/30 transition-colors group-hover:text-accent">
                    →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
