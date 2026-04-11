# Sentry

Personal portfolio for **Adelusi Dan Kunle** — AI Engineer · Automation Architect · LLM Specialist.

An editorial-dark, liquid-glass portfolio built as an AI product: it ranks for Dan's name, closes clients via a grounded Gemini-powered AI twin, and captures qualified leads into Supabase.

## Stack

- **Next.js 16** (App Router · TypeScript · Turbopack)
- **React 19**
- **Tailwind v4** (CSS variables · glass utilities)
- **Framer Motion 11** · **GSAP 3** · **Lenis** (smooth scroll)
- **`@google/genai`** — Gemini 2.5 Flash streaming
- **Supabase** — conversations, leads, rate limit
- **Vercel** — hosting, analytics, speed insights

## Getting started

```bash
cp .env.example .env.local
# fill in GOOGLE_AI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

npm install
npm run dev
# → http://localhost:3000
```

## Scripts

- `npm run dev` — Turbopack dev server
- `npm run build` — Production build
- `npm start` — Serve production build
- `npm run lint` — ESLint

## Project docs

- [`CLAUDE.md`](./CLAUDE.md) — project brain, design system, 9-prompt framework
- [`AGENTS.md`](./AGENTS.md) — Next.js 16 breaking-change warning

## Security

**Never commit** `GOOGLE_AI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY`. They live only in `.env.local` (gitignored) and Vercel env vars. The chat and lead APIs call those services server-side only.
