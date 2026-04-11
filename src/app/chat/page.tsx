import type { Metadata } from "next";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/layout/container";
import { GradientMesh } from "@/components/motion/gradient-mesh";
import { ChatPanel } from "@/components/ai/chat-panel";

export const metadata: Metadata = {
  title: "Ask my AI twin",
  description:
    "Chat with Dan's AI twin — grounded on his real projects, services, and availability. Built on Gemini.",
};

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
        </Container>
      </main>
      <Footer />
    </>
  );
}
