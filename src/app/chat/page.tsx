import type { Metadata } from "next";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/layout/container";
import { GradientMesh } from "@/components/motion/gradient-mesh";
import { Reveal } from "@/components/motion/reveal";
import { GlassCard } from "@/components/ui/glass-card";
import { ChatPanel } from "@/components/ai/chat-panel";

export const metadata: Metadata = {
  title: "Ask my AI agent",
  description:
    "Talk to Dan's AI agent — grounded on his real projects, services, and availability. Built on Gemini with function calling.",
};

const embedCode = `<script src="https://adelusidankunle.vercel.app/widget/sentry-chat.min.js"
  data-api-key="YOUR_GEMINI_KEY"
  data-name="My Assistant"><\/script>`;

export default function ChatPage() {
  return (
    <>
      <Nav />
      <main id="main" className="relative min-h-[100svh] overflow-hidden pt-36 pb-24">
        <GradientMesh intensity={0.6} />
        <Container className="relative z-10">
          <div className="mx-auto max-w-3xl">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/50">
              /chat
            </p>
            <h1 className="display-md mb-10 max-w-2xl leading-[0.95]">
              Ask me anything.
            </h1>
            <div className="glass-strong flex h-[70vh] flex-col p-6 md:p-10">
              <ChatPanel />
            </div>
          </div>

          {/* Widget promotion section */}
          <Reveal>
            <div className="mx-auto mt-24 max-w-3xl">
              <GlassCard className="p-8 md:p-12">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-lg">
                    <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
                      Free &amp; open
                    </p>
                    <h2 className="font-serif text-3xl leading-tight md:text-4xl">
                      Get this agent — free.
                    </h2>
                    <p className="mt-4 text-bone/70 leading-relaxed">
                      Drop an AI-powered chat widget on any website with one line
                      of code. Bring your own Gemini API key. Fully customisable —
                      name, colour, position. No account needed.
                    </p>
                  </div>
                  <a
                    href="/widget/sentry-chat.min.js"
                    download
                    className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-accent px-6 font-mono text-xs uppercase tracking-wider text-ink transition-all hover:-translate-y-[1px]"
                  >
                    Download widget ↓
                  </a>
                </div>

                <div className="mt-8 rounded-xl bg-ink/60 p-4">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-bone/50">
                    Embed in one line
                  </p>
                  <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-bone/80">
                    <code>{embedCode}</code>
                  </pre>
                </div>

                <div className="mt-6 flex flex-wrap gap-6 font-mono text-[10px] uppercase tracking-wider text-bone/50">
                  <span>Shadow DOM isolated</span>
                  <span>18KB minified</span>
                  <span>Gemini 2.5 Flash</span>
                  <span>Streaming responses</span>
                  <span>Mobile responsive</span>
                </div>
              </GlassCard>
            </div>
          </Reveal>
        </Container>
      </main>
      <Footer />
    </>
  );
}
