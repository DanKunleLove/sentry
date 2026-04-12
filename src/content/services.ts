import type { Service, EngagementType } from "./types";

export const services: Service[] = [
  {
    id: "ai-engineering",
    title: "AI Engineering & Agent Systems",
    lede: "Production AI products with Claude, Gemini, OpenAI, DeepSeek, OpenRouter — multi-agent orchestration, RAG, tool use, and reliable output.",
    deliverables: [
      "LLM-powered products shipped end-to-end",
      "Multi-agent orchestration and function calling",
      "RAG with source citations",
      "Prompt engineering and evaluation pipelines",
      "Cost + latency optimisation",
    ],
    stack: ["Gemini", "Claude", "OpenAI", "OpenRouter", "DeepSeek", "Vector DBs", "Next.js"],
    iconName: "brain-circuit",
    outcomes: ["Agentic workflows", "Grounded chatbots", "Custom copilots"],
  },
  {
    id: "automation",
    title: "Automation & Workflow Architecture",
    lede: "Design and ship multi-workflow automation systems that cut manual operations from days to minutes — across any platform.",
    deliverables: [
      "Workflow architecture, hosting, and monitoring",
      "CRM + WhatsApp + Shopify + Freshdesk integrations",
      "AI categorisation, routing, and decision logic",
      "Cross-platform orchestration and observability",
    ],
    stack: ["n8n", "Make.com", "Zapier", "GoHighLevel", "Chatwoot", "Monday.com", "Supabase", "Webhooks"],
    iconName: "workflow",
    outcomes: ["Property management pipelines", "Lead-gen workflows", "Customer-support automation"],
  },
  {
    id: "full-stack",
    title: "Full-Stack Product Development",
    lede: "Turn-key product builds — frontend, backend, infrastructure, auth, and AI integration under one roof.",
    deliverables: [
      "Next.js, React Native, or Shopify/WordPress frontends",
      "Supabase, FastAPI, or custom Node backends",
      "Auth, file storage, real-time, and deployment",
      "E-commerce, landing pages, and marketing sites",
    ],
    stack: ["Next.js", "React Native", "Supabase", "FastAPI", "Shopify", "WordPress", "Vercel"],
    iconName: "layers",
    outcomes: ["Marketplaces", "Dashboards", "Mobile apps with AI features"],
  },
  {
    id: "creative-ai",
    title: "Creative AI & Content Production",
    lede: "Image, video, voice, and ad generation pipelines — from concept to production-ready assets at scale.",
    deliverables: [
      "AI-generated image libraries and ad creative",
      "AI video and reel production workflows",
      "Voice cloning and avatar pipelines",
      "Content engines for social and marketing",
    ],
    stack: ["HeyGen", "Sora", "Flux", "Midjourney", "ElevenLabs", "MuseTalk", "Runway", "Grok Aurora"],
    iconName: "wand-sparkles",
    outcomes: ["Brand ad creative", "Product films", "AI avatar demos"],
  },
  {
    id: "ai-training",
    title: "AI Training & Evaluation",
    lede: "Model evaluation, preference ranking, factuality and code-correctness review — for AI platforms and research teams.",
    deliverables: [
      "RLHF training data and preference pairs",
      "Factuality and hallucination audits",
      "Code-correctness review for coding models",
      "Rubric design and evaluation protocols",
    ],
    stack: ["Outlier", "Mercor", "Scale AI", "Python", "Jupyter"],
    iconName: "scale",
    outcomes: ["Model quality gates", "Eval datasets", "Training data pipelines"],
  },
];

export const engagementTypes: EngagementType[] = [
  {
    id: "freelance",
    label: "Freelance",
    blurb: "Fixed-scope builds, 2–12 weeks. Ideal for MVPs, prototypes, and well-defined features.",
    iconName: "zap",
  },
  {
    id: "contract",
    label: "Contract / Retainer",
    blurb: "Ongoing engagement, 3–12 months. For teams shipping AI features continuously.",
    iconName: "handshake",
  },
  {
    id: "remote-ft",
    label: "Remote Full-Time",
    blurb: "Founding engineer, senior AI engineer, or LLM specialist roles with global teams.",
    iconName: "globe-2",
  },
  {
    id: "advisory",
    label: "Advisory",
    blurb: "Architecture review, AI roadmap, due diligence — for founders and technical leadership.",
    iconName: "compass",
  },
  {
    id: "training",
    label: "AI Training & Eval",
    blurb: "RLHF, preference ranking, code correctness, factuality — Outlier, Mercor, Scale AI work.",
    iconName: "graduation-cap",
  },
];
