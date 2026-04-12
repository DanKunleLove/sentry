"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-ink transition-all hover:-translate-y-[1px] print:hidden"
      onClick={() => window.print()}
    >
      Download PDF ↓
    </button>
  );
}
