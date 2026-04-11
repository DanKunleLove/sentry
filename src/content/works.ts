import type { Work } from "./types";

/**
 * Source of truth for all case studies.
 * Slug becomes the URL at /work/[slug].
 * Cover images are placeholders for now — replace with real screenshots as they arrive.
 */
export const works: Work[] = [
  {
    slug: "phantm",
    title: "Phantm",
    tagline: "Real-time AI avatar & digital-twin platform",
    year: 2025,
    client: "SourceXAI",
    role: "Sole AI Engineer",
    status: "live",
    categories: ["ai", "platform", "voice", "creative-ai"],
    stack: [
      "FastAPI",
      "RunPod",
      "MuseTalk 1.5",
      "CosyVoice 2",
      "faster-whisper",
      "Deep-Live-Cam",
      "Cloudflare R2",
      "Next.js 14",
    ],
    cover: {
      src: "/images/work/phantm-cover.webp",
      alt: "Phantm — real-time AI avatar platform",
      width: 1600,
      height: 900,
    },
    metrics: [
      { label: "API endpoints", value: "47" },
      { label: "Inference", value: "GPU / RunPod" },
      { label: "Services", value: "6+" },
    ],
    summary:
      "Solo-engineered full-stack specification for a real-time AI avatar platform — 47 documented API endpoints, GPU inference via RunPod, and a Next.js 14 frontend with Cloudflare R2 asset storage.",
    reasoning:
      "The core architectural choice was decoupling inference from session state: each model (MuseTalk, CosyVoice, faster-whisper, Deep-Live-Cam) runs as an independent GPU-backed microservice behind a thin FastAPI gateway. This isolates latency-critical paths, lets each model scale independently on RunPod, and makes the platform resilient — one avatar service degrading can't stall the rest.",
    problem:
      "The client needed a production real-time avatar and digital-twin platform that could do voice cloning, lip sync, live camera deepfakes, and streaming speech-to-text — all behind a clean API consumable by web and mobile clients. Existing open-source stacks didn't compose, weren't documented, and had no production-grade orchestration.",
    approach: [
      "Designed and documented a 47-endpoint API surface covering avatars, voice, STT, live-cam sessions, and asset management.",
      "Deployed each model as an independent GPU microservice on RunPod, with pre-warmed instances and autoscaling rules.",
      "Built the Next.js 14 frontend against the API with streaming SSE for STT and WebSocket channels for live sessions.",
      "Integrated Cloudflare R2 for cost-efficient asset storage with CDN-backed delivery.",
    ],
    outcome: [
      "A production-ready avatar platform with full API docs, deployable on demand.",
      "GPU inference orchestration tuned for cold-start minimization.",
      "End-to-end session flows proven on real client use cases.",
    ],
    tags: ["AI Avatar", "Voice Cloning", "GPU Inference", "FastAPI", "RunPod"],
    featured: true,
    order: 1,
  },
  {
    slug: "dalle",
    title: "Dalle",
    tagline: "Premium voice agent — Cerebras · Cartesia · LiveKit",
    year: 2025,
    client: "Independent",
    role: "Sole Engineer",
    status: "in-development",
    categories: ["ai", "voice", "agent"],
    stack: ["Cerebras", "Cartesia", "LiveKit", "Python", "FastAPI"],
    cover: {
      src: "/images/work/dalle-cover.webp",
      alt: "Dalle — premium real-time voice agent",
      width: 1600,
      height: 900,
    },
    metrics: [
      { label: "Inference", value: "Cerebras" },
      { label: "TTS", value: "Cartesia" },
      { label: "Transport", value: "LiveKit" },
    ],
    summary:
      "A premium low-latency voice agent using the Cerebras inference cookbook, Cartesia for ultra-fast TTS, and LiveKit for WebRTC transport — a real-time conversational AI with negligible user-perceived latency.",
    reasoning:
      "Voice agents live or die on round-trip latency. I chose Cerebras for sub-100ms LLM inference, Cartesia for neural TTS that streams the first audio chunk in under 200ms, and LiveKit for WebRTC so audio hops server→client without TCP head-of-line blocking. Each layer is individually replaceable without touching the others.",
    problem:
      "Consumer voice agents feel robotic because latency between speech-end and response-start is over a second. The goal was sub-500ms end-to-end for a natural, interruption-tolerant conversation.",
    approach: [
      "Piped live mic audio over LiveKit WebRTC into a streaming transcription worker.",
      "Routed transcripts to Cerebras LLM inference with early-exit streaming.",
      "Streamed generated tokens into Cartesia TTS and piped audio back over the same LiveKit channel.",
      "Implemented barge-in detection so the user can interrupt mid-sentence.",
    ],
    outcome: [
      "Sub-500ms measured round-trip latency in early testing.",
      "Clean, swappable stack — each component is a separate module.",
      "Foundation for press-to-talk integration on the Sentry portfolio itself.",
    ],
    tags: ["Voice Agent", "WebRTC", "Cerebras", "LiveKit", "Low Latency"],
    featured: true,
    order: 2,
  },
  {
    slug: "studia",
    title: "Studia",
    tagline: "Multi-tenant AI study assistant with source citations",
    year: 2025,
    client: "Mabi Labs",
    role: "Lead AI Engineer",
    status: "in-development",
    categories: ["ai", "full-stack", "platform"],
    stack: ["Next.js", "Supabase", "Vector DB", "OpenRouter", "Claude"],
    cover: {
      src: "/images/work/studia-cover.webp",
      alt: "Studia — campus-first multi-tenant AI study assistant",
      width: 1600,
      height: 900,
    },
    metrics: [
      { label: "Tenancy", value: "3-level" },
      { label: "Sources", value: "PDF · Audio · Slides" },
      { label: "Answers", value: "Cited" },
    ],
    summary:
      "A campus-first, multi-tenant AI study assistant (Institution → Faculty → Department) that indexes uploaded PDFs, audio, and slides and answers questions with source citations.",
    reasoning:
      "University content is hierarchical and deeply context-dependent — a CS algorithms question should never pull from a different faculty's material. The architectural move was three-level tenancy: every document carries institution/faculty/department tags, and the retriever filters on them before embedding search. That keeps answers relevant and makes the platform safe to deploy across multiple schools on one database.",
    problem:
      "Students drown in PDFs, recorded lectures, and slide decks. Generic LLM chat has no idea what's actually on their syllabus, and generic RAG ignores the institutional context that makes an answer correct.",
    approach: [
      "Three-level tenancy model (Institution → Faculty → Department) scoped into every retrieval query.",
      "Multi-modal ingestion: PDFs via parser + OCR, audio via faster-whisper, slides via structured extraction.",
      "Hybrid retrieval (BM25 + vector) with citation pointers back to the source document.",
      "Role-based access: students see their own department, admins see their own institution.",
    ],
    outcome: [
      "A deployable SaaS shell for campus AI assistants.",
      "Answers ground in real uploaded material with citations — no hallucinations.",
      "Approaching public launch for a pilot institution.",
    ],
    tags: ["RAG", "Multi-tenant", "Education", "Citations", "Next.js"],
    featured: true,
    order: 3,
  },
  {
    slug: "mocha-property",
    title: "Mocha Property",
    tagline: "n8n property management automation — days to minutes",
    year: 2024,
    client: "Mocha Property · 10Ninety (UK)",
    role: "Sole Automation Architect",
    status: "live",
    categories: ["automation", "ai", "platform"],
    stack: ["n8n", "OpenRouter", "DeepSeek", "Supabase", "Webhooks"],
    cover: {
      src: "/images/work/mocha-cover.webp",
      alt: "Mocha Property — n8n property automation pipeline",
      width: 1600,
      height: 900,
    },
    links: [
      { label: "Live", href: "https://mocha-property.vercel.app" },
    ],
    metrics: [
      { label: "Processing time", value: "Days → Minutes" },
      { label: "Workflows", value: "Multi-stage" },
      { label: "Client", value: "UK-based" },
    ],
    summary:
      "A multi-stage n8n automation system for a UK property-management client: maintenance intake → AI categorisation → contractor dispatch → automated landlord reporting. Cut client processing time from days to minutes.",
    reasoning:
      "Property management is fundamentally a routing problem — the right request has to reach the right contractor with the right context, fast. Instead of a monolithic CRM integration, I built small n8n workflows chained together, each one responsible for a single state transition. That makes the system trivially debuggable and lets the client add new routing rules without touching code.",
    problem:
      "The client was manually triaging maintenance tickets: reading each one, deciding category, picking a contractor, chasing updates, and writing landlord reports by hand. Turnaround was days. Mistakes were frequent.",
    approach: [
      "Stage 1: webhook ingest from the tenant portal.",
      "Stage 2: AI categorisation via OpenRouter/DeepSeek with a strict JSON schema.",
      "Stage 3: contractor selection against a capability matrix.",
      "Stage 4: dispatch notification + acknowledgement loop.",
      "Stage 5: auto-generated landlord report at job completion.",
    ],
    outcome: [
      "Manual processing cut from days to minutes.",
      "Clear audit trail for every maintenance request.",
      "Reusable template now applied to a second client (10Ninety).",
    ],
    tags: ["n8n", "Automation", "Property Management", "AI Routing"],
    featured: true,
    order: 4,
  },
  {
    slug: "telos",
    title: "TELOS",
    tagline: "AI Freelance Success Platform — Red Bull Basement 2026",
    year: 2025,
    client: "Mabi Labs · Red Bull Basement 2026",
    role: "Founder & Product Architect",
    status: "concept",
    categories: ["ai", "platform", "agent"],
    stack: ["Next.js", "Supabase", "Gemini", "Edge Functions"],
    cover: {
      src: "/images/work/telos-cover.webp",
      alt: "TELOS — AI-powered freelancer success platform",
      width: 1600,
      height: 900,
    },
    metrics: [
      { label: "Programme", value: "Red Bull Basement 2026" },
      { label: "Stage", value: "Submitted" },
      { label: "Thesis", value: "AI-assisted freelancing" },
    ],
    summary:
      "Founded and submitted TELOS — an AI-powered freelancer career-optimisation platform — to the Red Bull Basement 2026 Global Innovation Programme. Designed for AI job matching, performance analytics, intelligent growth coaching, and marketplace-success reverse-engineering.",
    reasoning:
      "Most freelance platforms optimize for the buyer. TELOS inverts that: the AI agent works for the freelancer, continually analyzing marketplace signals, matching them to the right jobs, coaching them on proposals, and reverse-engineering what makes top-earners win. It's a long-term career copilot, not a job board.",
    problem:
      "Freelancers on Fiverr/Upwork hit a ceiling because the platforms are designed to match clients to sellers, not to make sellers better. There's no coaching, no analytics, no way to systematically improve conversion.",
    approach: [
      "AI job-matching engine weighting freelancer strengths against live listings.",
      "Performance analytics dashboard tracking win rate, response time, rating.",
      "Intelligent growth coaching via chat — specific, personalised next-step suggestions.",
      "Reverse-engineering tools that analyse top-performer profiles and proposals.",
    ],
    outcome: [
      "Product vision submitted to Red Bull Basement 2026.",
      "Core architecture designed for a Q3 2026 build.",
      "Thesis validated via direct outreach to top freelancers.",
    ],
    tags: ["Freelance Platform", "Career Coaching", "AI Agent", "Analytics"],
    featured: true,
    order: 5,
  },
  {
    slug: "liveself",
    title: "LiveSelf",
    tagline: "Be everywhere at once — persistent digital presence",
    year: 2026,
    client: "Mabi Labs",
    role: "Lead AI Specialist",
    status: "in-development",
    categories: ["ai", "agent", "voice"],
    stack: ["Jupyter", "Python", "LLMs", "Voice cloning"],
    cover: {
      src: "/images/work/liveself-cover.webp",
      alt: "LiveSelf — be everywhere at once",
      width: 1600,
      height: 900,
    },
    metrics: [
      { label: "Thesis", value: "Always-on AI self" },
      { label: "Status", value: "Active build" },
    ],
    summary:
      "LiveSelf is a persistent digital-self platform — a personal always-on AI presence that responds in your voice, in your context, across channels. Currently in active development.",
    reasoning:
      "Digital twins usually fail because they try to be general-purpose. LiveSelf narrows the scope: your AI self only answers questions it has been trained to answer, in your tone, with guardrails. The rest it escalates. That makes it actually deployable.",
    problem:
      "People can't scale their attention. Executives, founders, and creators miss messages, skip community engagement, and can't be 'everywhere' they want to be — even though they'd love to.",
    approach: [
      "Knowledge-base ingestion from the user's own documents, recordings, and social content.",
      "Voice cloning for audio responses.",
      "Tone mimicry tuned per channel (Slack vs email vs DM).",
      "Human-in-the-loop escalation for anything outside the trained scope.",
    ],
    outcome: [
      "Active development — foundational architecture in place.",
      "Plays directly into the broader AI-twin thesis (see Phantm, /chat).",
    ],
    tags: ["Digital Twin", "Voice", "Presence", "Agent"],
    featured: true,
    order: 6,
  },
  {
    slug: "mabilabs",
    title: "Mabi Labs V2",
    tagline: "The agency site for the work itself",
    year: 2026,
    client: "Mabi Labs",
    role: "Founding Member & Lead AI Specialist",
    status: "live",
    categories: ["full-stack", "platform"],
    stack: ["Next.js", "TypeScript", "Vercel"],
    cover: {
      src: "/images/work/mabilabs-cover.webp",
      alt: "Mabi Labs — AI agency site",
      width: 1600,
      height: 900,
    },
    links: [
      { label: "Live", href: "https://mabilabs-v2.vercel.app" },
    ],
    metrics: [
      { label: "Agency", value: "4 countries" },
      { label: "Focus", value: "AI automation" },
    ],
    summary:
      "The second iteration of the Mabi Labs agency site — a positioning refresh for an AI automation and software agency serving paying clients across the UK, US, Canada, and Dubai.",
    reasoning:
      "Agency websites usually over-explain. V2 strips the site to three promises — ship fast, ship production-grade AI, serve global clients — and lets the work speak for the rest.",
    problem:
      "The original Mabi Labs site tried to sell every service to everyone. It was noisy and hard to remember.",
    approach: [
      "Clarified positioning around AI automation, LLM products, and full-stack delivery.",
      "Redesigned with tighter typography and fewer words.",
      "Highlighted the four-country client roster as the lead credibility signal.",
    ],
    outcome: [
      "Live at mabilabs-v2.vercel.app.",
      "Clearer inbound from the right clients.",
    ],
    tags: ["Agency Site", "Positioning", "Next.js"],
    featured: false,
    order: 7,
  },
  {
    slug: "deep-research-agent",
    title: "Deep Research Agent",
    tagline: "Autonomous research agent with structured outputs",
    year: 2025,
    client: "Mabi Labs",
    role: "Sole Engineer",
    status: "in-development",
    categories: ["ai", "agent", "automation"],
    stack: ["Python", "Claude", "Gemini", "Web search", "JSON schemas"],
    cover: {
      src: "/images/work/deep-research-cover.webp",
      alt: "Deep Research Agent",
      width: 1600,
      height: 900,
    },
    metrics: [
      { label: "Output", value: "Structured" },
      { label: "Sources", value: "Cited" },
    ],
    summary:
      "An autonomous research agent that takes a research question, plans a multi-step search, gathers sources, and returns a structured report with citations.",
    reasoning:
      "Research agents fail because they confuse 'gathering information' with 'answering the question'. I built a two-phase agent: a planner that decomposes the question into verifiable sub-questions, then a searcher/synthesizer that answers each sub-question with cited evidence. The structured output schema forces the agent to commit to claims.",
    problem:
      "Generic research-agent demos sound impressive but produce unstructured walls of text that are hard to trust or re-use downstream.",
    approach: [
      "Question → planner → sub-question list.",
      "Each sub-question → web search + synthesis with source tracking.",
      "Final structured report with claims + citations in a fixed JSON schema.",
    ],
    outcome: [
      "Reliable structured research reports.",
      "Integrates into downstream automation workflows.",
    ],
    tags: ["Research Agent", "Structured Output", "Citations"],
    featured: false,
    order: 8,
  },
  {
    slug: "purselley",
    title: "Purselley",
    tagline: "Premium iOS pool-chemistry calculator",
    year: 2025,
    client: "Premium client",
    role: "Sole iOS Engineer",
    status: "shipped",
    categories: ["mobile", "full-stack"],
    stack: ["Capacitor", "Swift", "iOS"],
    cover: {
      src: "/images/work/purselley-cover.webp",
      alt: "Purselley — premium iOS pool chemistry calculator",
      width: 1600,
      height: 900,
    },
    metrics: [
      { label: "Platform", value: "iOS" },
      { label: "Distribution", value: "App Store" },
    ],
    summary:
      "A premium iOS app for pool chemistry computations — polished native UI, rigorous calculation logic, full App Store lifecycle from scoping through submission.",
    reasoning:
      "Chemistry apps fail by exposing too many knobs. Purselley takes the opposite view: the user enters a small number of real measurements, the app does the math, and the user gets one clear action — a dose, a target, a warning. Less is the feature.",
    problem:
      "Pool owners and maintenance pros need fast, accurate chemical calculations but existing apps were either hobbyist toys or enterprise complexity.",
    approach: [
      "Tight Capacitor + native iOS wrapper for full platform polish.",
      "Custom calculation engine validated against real pool data.",
      "App Store lifecycle: privacy, review prep, screenshots, submission.",
    ],
    outcome: [
      "Shipped to the App Store.",
      "Premium positioning, premium finish.",
    ],
    tags: ["iOS", "Chemistry", "Premium", "App Store"],
    featured: false,
    order: 9,
  },
  {
    slug: "lenticular",
    title: "Lenticular Art Marketplace",
    tagline: "E-commerce with bidirectional Notion sync",
    year: 2024,
    client: "Independent client",
    role: "Sole Engineer",
    status: "shipped",
    categories: ["full-stack", "platform"],
    stack: ["React", "Supabase", "Base44", "Notion API", "Cloudflare R2"],
    cover: {
      src: "/images/work/lenticular-cover.webp",
      alt: "Lenticular art marketplace",
      width: 1600,
      height: 900,
    },
    metrics: [
      { label: "Bandwidth reduction", value: "~95%" },
      { label: "Catalog sync", value: "Notion ⇌" },
    ],
    summary:
      "A React/Supabase/Base44 lenticular-art marketplace with bidirectional Notion sync, dual-bucket image compression (~95% bandwidth reduction), and a full e-commerce pipeline.",
    reasoning:
      "The client managed their catalog in Notion and wanted to keep doing that. Instead of forcing a CMS change, I built a bidirectional sync so Notion remained the source of truth while the marketplace read from a fast, optimized copy.",
    problem:
      "The client had thousands of high-resolution images and wanted a fast marketplace without losing their Notion-based catalog workflow.",
    approach: [
      "Bidirectional Notion ↔ Supabase sync with conflict resolution.",
      "Dual-bucket image compression pipeline — original quality for buyers, compressed for browsing.",
      "Full e-commerce pipeline with cart, checkout, and order management.",
    ],
    outcome: [
      "~95% image bandwidth reduction for the browsing layer.",
      "Notion stayed the client's source of truth — zero workflow disruption.",
      "Marketplace shipped and operational.",
    ],
    tags: ["E-commerce", "Notion API", "Supabase", "Image Compression"],
    featured: false,
    order: 10,
  },
];

export const featuredWorks = works.filter((w) => w.featured).sort((a, b) => a.order - b.order);
export const allWorks = [...works].sort((a, b) => a.order - b.order);
