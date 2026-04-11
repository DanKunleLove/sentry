"use client";
import { useEffect } from "react";

type Opts = { preventDefault?: boolean };

/**
 * Subscribe to a keyboard shortcut while mounted.
 * `combo` examples: "mod+k" (cmd on mac, ctrl elsewhere), "?", "`", "Escape".
 */
export function useKeyboardShortcut(
  combo: string,
  handler: (e: KeyboardEvent) => void,
  opts: Opts = { preventDefault: true }
): void {
  useEffect(() => {
    const parts = combo.toLowerCase().split("+");
    const needMod = parts.includes("mod");
    const needShift = parts.includes("shift");
    const needAlt = parts.includes("alt");
    const targetKey = parts.filter(
      (p) => !["mod", "shift", "alt"].includes(p)
    )[0];

    const listener = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (needMod && !mod) return;
      if (!needMod && mod) return;
      if (needShift !== e.shiftKey) return;
      if (needAlt !== e.altKey) return;
      if (targetKey && e.key.toLowerCase() !== targetKey) return;
      if (opts.preventDefault) e.preventDefault();
      handler(e);
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [combo, handler, opts.preventDefault]);
}
