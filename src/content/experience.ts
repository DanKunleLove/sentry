import type { Experience } from "./types";

export const experience: Experience[] = [
  {
    company: "Mabi Labs",
    companyUrl: "https://mabilabs.ai",
    role: "Founding Member & Lead AI Specialist",
    location: "Lagos, Nigeria · Remote-first",
    start: "2024-01",
    end: "Present",
    kind: "founding",
    highlights: [
      "Architect and ship full-stack AI products end-to-end — scoping, system design, live deployment — for clients across UK, US, Canada, Dubai, and beyond.",
      "Shipped a multi-workflow n8n property-management automation (Mocha Property, 10Ninety) — reducing manual processing from days to minutes.",
      "Built self-hosted AI infrastructure on DigitalOcean with Docker, integrating OpenRouter, DeepSeek, and Anthropic APIs for live client deployments.",
    ],
    stack: ["Next.js", "Supabase", "n8n", "OpenRouter", "DeepSeek", "Docker", "DigitalOcean"],
  },
  {
    company: "SourceXAI",
    role: "Sole AI Engineer — Independent Contractor",
    location: "Remote",
    start: "2024-01",
    end: "Present",
    kind: "engineering",
    highlights: [
      "Sole engineer owning the complete AI product lifecycle — LLM integration, chatbot architecture, and automation design for international clients.",
      "Built and documented 47 API endpoints for Phantm — a real-time AI avatar platform — using MuseTalk 1.5, CosyVoice 2, FastAPI, and RunPod.",
      "Delivered CRM-integrated chatbots, voice agents, and intelligent workflow systems designed for reliability and scale.",
    ],
    stack: ["FastAPI", "RunPod", "MuseTalk", "CosyVoice 2", "Cloudflare R2", "Next.js 14"],
  },
  {
    company: "Outlier · Mercor · Scale AI",
    role: "AI Trainer & Evaluator",
    location: "Remote",
    start: "2024-06",
    end: "Present",
    kind: "training",
    highlights: [
      "AI evaluation and training across leading platforms: RLHF, preference ranking, code correctness, factuality, and instruction-following compliance.",
      "Specialist domains: software engineering, AI & ML, full-stack development, prompt engineering, and STEM reasoning.",
    ],
  },
  {
    company: "Independent — Global Clients",
    role: "Freelance AI Developer & AI Trainer",
    location: "Remote",
    start: "2023-01",
    end: "Present",
    kind: "engineering",
    highlights: [
      "Completed 20+ AI and software projects for clients worldwide: mobile apps, SaaS builds, AI automation, and LLM integrations.",
      "Built and published iOS and Android apps with full App Store deployment pipelines.",
      "Developed n8n-powered lead-generation workflows integrating Apollo.io, Apify scraping, and AI-personalised email delivery at scale.",
    ],
  },
];

export const education = [
  {
    institution: "Federal University Oye Ekiti, Nigeria",
    degree: "B.Sc. Physics & Computer Science",
    location: "Ekiti, Nigeria",
    start: "2022",
    end: "Expected June 2026",
    gpa: "4.5 / 5.0 — First-Class track",
    highlights: [
      "Vice President, Physics Department (2024–2025 session) — led departmental initiatives and student engagement.",
      "Administrative Assistant, Student Union Government — served a university of over 50,000 students.",
      "Relevant coursework: algorithms, data structures, machine learning, statistical physics, computational modelling, software engineering.",
    ],
  },
  {
    institution: "Harvard CS50",
    degree: "CS50 Artificial Intelligence with Python",
    location: "Online",
    start: "2025",
    end: "In Progress",
    gpa: undefined,
    highlights: [
      "Registered and actively pursuing Harvard's AI and Python programme.",
    ],
  },
];
