import { Suspense } from "react";
import type { Metadata } from "next";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { BookingWizard } from "@/components/sections/booking-wizard";

export const metadata: Metadata = {
  title: "Book a Free AI Setup Session — Dan Adelusi",
  description:
    "Get personalized AI guidance from an engineer who's built AI systems for clients across the UK, US, and Dubai.",
  openGraph: {
    title: "Book a Free AI Setup Session — Dan Adelusi",
    description:
      "Get personalized AI guidance from an engineer who's built AI systems for clients across the UK, US, and Dubai.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Book a Free AI Setup Session — Dan Adelusi",
    description:
      "Get personalized AI guidance from an engineer who's built AI systems for clients across the UK, US, and Dubai.",
  },
};

const bullets = [
  "Personalized AI guidance for your exact workflow — not generic tips",
  "Tool recommendations that fit your budget and your team",
  "A live walkthrough of how to actually implement it",
];

export default function BookPage() {
  return (
    <>
      <SmoothScroll />
      <Nav />
      <main id="main" className="pt-36 sm:pt-48">
        <Container>
          <div className="mx-auto max-w-2xl pb-24">
            <Reveal>
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/50">
                Free · 30 minutes · Video call
              </p>
              <h1 className="display-md mb-6">
                Book a free AI setup session.
              </h1>
              <ul className="mb-6 space-y-3">
                {bullets.map((b) => (
                  <li key={b} className="flex gap-3 text-bone/70">
                    <span
                      aria-hidden="true"
                      className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                    />
                    {b}
                  </li>
                ))}
              </ul>
              <p className="mb-10 text-sm text-bone/50">
                I&rsquo;m Dan Adelusi — AI engineer and co-founder of Mabi Labs.
                I&rsquo;ve built AI systems for clients across the UK, US,
                Canada, and Dubai. Pick a time below — slots are my real, live
                availability.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <Suspense fallback={null}>
                <BookingWizard />
              </Suspense>
            </Reveal>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
