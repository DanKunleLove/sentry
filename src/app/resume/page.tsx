import type { Metadata } from "next";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/layout/container";
import { experience, education } from "@/content/experience";
import { skillGroups } from "@/content/skills";
import { PrintButton } from "@/components/ui/print-button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resume — Adelusi Dan Kunle",
  description:
    "Résumé for Adelusi Dan Kunle — AI Engineer, Automation Architect, LLM Specialist.",
};

export default function ResumePage() {
  return (
    <>
      <Nav />
      <main id="main" className="pt-36 pb-24 print:pt-0">
        <Container className="max-w-3xl print:max-w-full">
          <header className="mb-10 border-b border-bone/15 pb-6 print:border-black/30">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-serif text-5xl tracking-tight print:text-black">
                  Adelusi Dan Kunle
                </h1>
                <p className="mt-2 font-mono text-xs uppercase tracking-widest text-accent print:text-black">
                  AI & Automation Architect · LLM Specialist · AI Engineer
                </p>
                <p className="mt-2 text-sm text-bone/70 print:text-black/80">
                  {site.location} · {site.email} · {site.socials.github} · {site.socials.linkedin}
                </p>
              </div>
              <PrintButton />
            </div>
          </header>

          <Section title="Profile">
            <p className="leading-relaxed text-bone/85 print:text-black">
              AI Engineer and Automation Architect shipping production LLM products,
              agent systems, and creative-AI pipelines for international clients.
              Founding Member and Lead AI Specialist at Mabi Labs; sole AI engineer at
              SourceXAI. AI trainer and evaluator for Outlier, Mercor, and Scale AI.
              Physics & Computer Science graduate (CGPA 4.5/5.0, First-Class track).
              Available globally for freelance, contract, remote full-time, advisory,
              and AI training engagements.
            </p>
          </Section>

          <Section title="Experience">
            <div className="space-y-6">
              {experience.map((e) => (
                <div key={e.company + e.role}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold">{e.role}</p>
                    <p className="font-mono text-xs uppercase tracking-wider text-bone/60 print:text-black/70">
                      {e.start} — {e.end}
                    </p>
                  </div>
                  <p className="font-mono text-xs uppercase tracking-wider text-accent print:text-black">
                    {e.company} · {e.location}
                  </p>
                  <ul className="mt-3 space-y-1.5 text-sm text-bone/80 print:text-black/85">
                    {e.highlights.map((h) => (
                      <li key={h} className="flex gap-3">
                        <span className="text-accent print:text-black/60">▸</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Education">
            {education.map((e) => (
              <div key={e.institution} className="mb-4">
                <p className="font-semibold">{e.degree}</p>
                <p className="font-mono text-xs uppercase tracking-wider text-accent print:text-black">
                  {e.institution}
                </p>
                <p className="font-mono text-xs uppercase tracking-wider text-bone/60 print:text-black/70">
                  {e.start} — {e.end} · {e.gpa}
                </p>
              </div>
            ))}
          </Section>

          <Section title="Skills">
            <div className="grid gap-4 sm:grid-cols-2">
              {skillGroups.map((g) => (
                <div key={g.name}>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-accent print:text-black">
                    {g.name}
                  </p>
                  <p className="text-sm text-bone/80 print:text-black/85">
                    {g.skills.join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        </Container>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10 print:mb-6">
      <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-accent print:text-black">
        {title}
      </h2>
      {children}
    </section>
  );
}
