import type { Metadata } from "next";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { ServicesAccordion } from "@/components/sections/services-accordion";
import { EngagementTypes } from "@/components/sections/engagement-types";
import { ChatTeaser } from "@/components/sections/chat-teaser";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Services — LLM, Automation, Full-Stack AI & Creative-AI",
  description:
    "Five service lanes — LLM integration, n8n automation, full-stack AI products, creative-AI production, and AI evaluation / RLHF.",
};

export default function ServicesPage() {
  return (
    <>
      <SmoothScroll />
      <Nav />
      <main id="main" className="pt-48">
        <Container>
          <Reveal>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/50">
              Services
            </p>
            <h1 className="display-lg mb-10 max-w-4xl">
              Five lanes. One operator.
            </h1>
            <p className="max-w-2xl text-lg text-bone/70">
              I take work across five lanes — all AI-adjacent, all production-grade,
              all delivered end-to-end. Pick the one that fits your problem, or
              ask my AI twin if you&rsquo;re not sure.
            </p>
          </Reveal>
        </Container>

        <ServicesAccordion hideHeading />
        <EngagementTypes />
        <ChatTeaser />
      </main>
      <Footer />
    </>
  );
}
