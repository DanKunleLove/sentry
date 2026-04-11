/** Canonical site constants used across metadata, JSON-LD, and links. */
export const site = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://sentry-dankunle.vercel.app",
  name: "Adelusi Dan Kunle",
  title: "Adelusi Dan Kunle — AI Engineer · Automation Architect · LLM Specialist",
  description:
    "AI Engineer, LLM Specialist, and Automation Architect shipping production AI products and automation pipelines for international clients.",
  email: "adelusidankunle@gmail.com",
  location: "Lagos, Nigeria",
  socials: {
    github: "https://github.com/DanKunleLove",
    linkedin: "https://www.linkedin.com/in/dan-adelusi-057733322",
    x: "https://x.com/dankunle_01",
    tiktok: "https://www.tiktok.com/@dkl612",
    instagram: "https://www.instagram.com/dankunleai",
    mabilabs: "https://mabilabs.ai",
  },
} as const;
