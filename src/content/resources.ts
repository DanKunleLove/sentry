/**
 * Post-session resource packs, keyed by content-pillar source (?src= on /book).
 * Sent automatically AFTER an approved session ends — never before.
 * Swap the placeholder links for real Notion/Drive links as packs are created.
 */

export interface ResourcePack {
  /** Short label used in the email subject/body. */
  title: string;
  /** Public link to the pack (Notion page, Drive folder, etc.). */
  url: string;
  /** One-liner shown in the email above the link. */
  blurb: string;
}

/** Fallback pack when the source is unknown or has no dedicated pack yet. */
export const defaultPack: ResourcePack = {
  title: "AI Starter Resource Pack",
  url: "https://example.com/replace-with-real-pack", // TODO: real link before launch
  blurb:
    "The core tools, prompts, and workflows I recommend to everyone starting with AI.",
};

/** Per-pillar packs. Keys must match the ?src= values used in content links. */
export const packsBySource: Record<string, ResourcePack> = {
  // "tiktok-automation": {
  //   title: "Automation Resource Pack",
  //   url: "https://...",
  //   blurb: "Everything from the automation series — templates included.",
  // },
};

export function packForSource(source: string | null | undefined): ResourcePack {
  if (source && packsBySource[source]) return packsBySource[source];
  return defaultPack;
}
