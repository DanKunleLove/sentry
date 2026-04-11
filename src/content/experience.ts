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
      "Architect and ship full-stack AI products end-to-end — scoping, system design, live deployment — for paying clients across UK, US, Canada, and Dubai.",
      "Designed and shipped a multi-workflow n8n property-management automation system (Mocha Property, 10Ninety) — intake → AI categorisation → contractor dispatch → landlord reporting — reducing manual processing from days to minutes.",
      "Built self-hosted AI assistant infrastructure on DigitalOcean VPS with Docker, integrating OpenRouter, DeepSeek, and Anthropic APIs with Telegram and Slack for live client deployments.",
      "Executing a full Freshdesk-to-Chatwoot customer support migration for a UK client, integrating WhatsApp (Meta Cloud API), Shopify order tracking, and n8n automation workflows.",
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
      "Sole engineer owning the complete AI product development lifecycle — LLM integration, chatbot architecture, automation system design for international clients.",
      "Delivered CRM-integrated chatbots, voice agents, and intelligent workflow systems — designed for reliability, scalability, and business-objective alignment.",
      "Built and documented 47 API endpoints for Phantm — a real-time AI avatar / digital-twin platform — using Deep-Live-Cam, MuseTalk 1.5, CosyVoice 2, faster-whisper, FastAPI, and RunPod.",
      "Applied advanced prompt engineering and agent design: chain-of-thought, multi-turn agent architecture, output reliability optimisation.",
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
      "AI evaluation and training work across leading platforms: RLHF, preference ranking, code correctness review, factuality assessment, instruction-following compliance.",
      "Specialist domains: software engineering, AI & machine learning, full-stack web development, prompt engineering, STEM reasoning, technical writing.",
      "Qualified for high-tier AI training and evaluation task assignments based on first-class STEM credentials and production engineering experience.",
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
      "Completed 20+ AI and software projects for clients worldwide: mobile app development, SaaS builds, AI automation, and LLM integrations.",
      "Built and published iOS and Android apps using Capacitor and React Native with full custom domain setup and app store deployment pipelines.",
      "Developed n8n-powered lead-generation workflows integrating Apollo.io enrichment, Apify scraping, and AI-personalised email delivery at scale.",
      "Engineered a lenticular art marketplace (React/Supabase/Base44) with bidirectional Notion sync, dual-bucket image compression (~95% bandwidth reduction), and full e-commerce pipeline.",
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
      "Physics foundation applied directly to engineering: first-principles reasoning, mathematical rigour, systems thinking.",
      "Relevant coursework: algorithms, data structures, machine learning, statistical physics, computational modelling, software engineering, HCI.",
    ],
  },
];
