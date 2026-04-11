import type { Metadata } from "next";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { GlassCard } from "@/components/ui/glass-card";

export const metadata: Metadata = {
  title: "Creative-AI Reel — Image · Video · Ads · Film",
  description:
    "AI-generated image, video, ad, and film production using Flux, Midjourney, Grok Aurora, ElevenLabs, MuseTalk, and Runway.",
};

const tools = [
  { name: "Flux", type: "Image gen" },
  { name: "Midjourney", type: "Image gen" },
  { name: "Grok Aurora", type: "Image gen" },
  { name: "Runway", type: "Video gen" },
  { name: "ElevenLabs", type: "Voice cloning" },
  { name: "MuseTalk", type: "Avatar lip-sync" },
  { name: "CosyVoice 2", type: "Voice agent TTS" },
  { name: "Deep-Live-Cam", type: "Live video" },
];

export default function CreativePage() {
  return (
    <>
      <SmoothScroll />
      <Nav />
      <main id="main" className="pt-48">
        <Container>
          <Reveal>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/50">
              Creative-AI Reel
            </p>
            <h1 className="display-lg mb-8 max-w-4xl">
              Image. Video. Voice. Avatar.
            </h1>
            <p className="max-w-2xl text-lg text-bone/70">
              Beyond engineering — I also produce creative-AI output for brands,
              ads, and film workflows. The reel is coming. The toolkit is below.
            </p>
          </Reveal>
        </Container>

        <section className="section-y">
          <Container>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {tools.map((t, i) => (
                <Reveal key={t.name} delay={i * 0.05}>
                  <GlassCard className="flex flex-col gap-2 p-8">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
                      {t.type}
                    </p>
                    <p className="font-serif text-2xl">{t.name}</p>
                  </GlassCard>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        <section className="section-y">
          <Container>
            <GlassCard variant="strong" className="p-12 md:p-16">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/50">
                Reel
              </p>
              <h2 className="display-md mb-6">
                Drop assets here.
              </h2>
              <p className="max-w-xl text-lg text-bone/70">
                This page is the home for the Creative-AI Reel. Once you share
                6–10 of your best AI-generated images, videos, or ads, they
                land here as a horizontal scroll-snap carousel.
              </p>
            </GlassCard>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
