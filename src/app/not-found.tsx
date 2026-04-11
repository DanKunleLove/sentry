import Link from "next/link";
import { Container } from "@/components/layout/container";
import { GradientMesh } from "@/components/motion/gradient-mesh";
import { Nav } from "@/components/layout/nav";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="relative flex min-h-[100svh] items-center overflow-hidden">
        <GradientMesh />
        <Container className="relative z-10 text-center">
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/50">
            404 · page not found
          </p>
          <h1 className="display-lg mb-8">
            This page hasn&rsquo;t been built yet.
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-bone/70">
            But the work is real. Head back to the start and see what has
            shipped — or talk to my AI twin.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="inline-flex h-12 items-center rounded-full bg-accent px-6 font-mono text-xs uppercase tracking-wider text-ink"
            >
              ← Home
            </Link>
            <Link
              href="/chat"
              className="glass-strong inline-flex h-12 items-center rounded-full px-6 font-mono text-xs uppercase tracking-wider text-bone"
            >
              Ask my AI twin
            </Link>
          </div>
        </Container>
      </main>
    </>
  );
}
