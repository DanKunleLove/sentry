import Link from "next/link";
import { Container } from "./container";
import { socials } from "@/content/nav";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-bone/8 py-16 mt-32">
      <Container>
        <div className="grid gap-12 md:grid-cols-[1fr_auto]">
          <div>
            <p className="font-serif text-3xl leading-tight md:text-5xl">
              Let&rsquo;s build
              <br />
              something real.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={`mailto:${site.email}`}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 font-mono text-xs uppercase tracking-wider text-ink transition-all hover:-translate-y-[1px]"
              >
                Get in touch →
              </a>
              <Link
                href="/chat"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-bone/16 px-6 font-mono text-xs uppercase tracking-wider text-bone transition-all hover:border-accent hover:text-accent"
              >
                Ask my AI twin
              </Link>
            </div>
            <p className="mt-6 font-mono text-xs uppercase tracking-wider text-bone/50">
              {site.email}
            </p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/50">
              Elsewhere
            </p>
            <ul className="flex flex-wrap gap-3 md:flex-col md:items-end md:gap-2">
              {socials.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs uppercase tracking-wider text-bone/70 transition-colors hover:text-bone"
                  >
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-bone/8 pt-8 md:flex-row md:items-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/40">
            © {new Date().getFullYear()} Adelusi Dan Kunle · Rendered in Lagos
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/40">
            Built with Next.js · Gemini · Supabase
          </p>
        </div>
      </Container>
    </footer>
  );
}
