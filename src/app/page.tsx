import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { NoiseOverlay } from "@/components/motion/noise-overlay";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Hero } from "@/components/sections/hero";
import { TechStrip } from "@/components/sections/tech-strip";
import { StatsBar } from "@/components/sections/stats-bar";
import { FeaturedWorks } from "@/components/sections/featured-works";
import { ServicesAccordion } from "@/components/sections/services-accordion";
import { EngagementTypes } from "@/components/sections/engagement-types";
import { ExperienceTimeline } from "@/components/sections/experience-timeline";
import { ChatTeaser } from "@/components/sections/chat-teaser";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <NoiseOverlay />
      <Nav />
      <main id="main" className="relative">
        <Hero />
        <TechStrip />
        <StatsBar />
        <FeaturedWorks />
        <ServicesAccordion />
        <EngagementTypes />
        <ExperienceTimeline />
        <ChatTeaser />
      </main>
      <Footer />
    </>
  );
}
