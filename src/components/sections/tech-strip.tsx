import { Marquee } from "@/components/motion/marquee";
import { techMarquee } from "@/content/about";

export function TechStrip() {
  const items = techMarquee.map((t) => (
    <span
      key={t}
      className="font-mono text-sm uppercase tracking-widest text-bone/40"
    >
      {t}
    </span>
  ));
  return (
    <div className="border-y border-bone/8 py-8">
      <Marquee items={items} speed={60} itemClassName="mx-6" />
    </div>
  );
}
