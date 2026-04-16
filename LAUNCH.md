# Sentry Launch Kit

## Free Design Directory Submissions

Submit to these free showcase/award sites to get visibility, backlinks, and credibility:

| Site | URL | Free? | Notes |
|------|-----|-------|-------|
| **Godly** | https://godly.website/submit | Yes | Top design showcase — submit via form |
| **Awwwards** | https://www.awwwards.com/submit | Free nomination | Others can nominate your site for free |
| **CSS Design Awards** | https://www.cssdesignawards.com/submit | Free tier | Basic listing is free |
| **Bestfolios** | https://www.bestfolios.com/submit | Yes | Portfolio-specific showcase |
| **SaaS Landing Page** | https://saaslandingpage.com/submit | Yes | Position the agent as a product |
| **Dribbble** | https://dribbble.com | Yes | Post screenshots of the site as shots |
| **Behance** | https://www.behance.net | Yes | Create a case study of the site + agent build |
| **Product Hunt** | https://www.producthunt.com | Yes | Launch the AI agent as a product |
| **Dev.to** | https://dev.to | Yes | Write "How I built an AI agent inside my portfolio" |
| **Hashnode** | https://hashnode.com | Yes | Same blog post, cross-post |
| **IndieHackers** | https://www.indiehackers.com | Yes | Share the build story |
| **Peerlist** | https://peerlist.io | Yes | Developer profile + project showcase |

### Submission Description
> AI-powered portfolio with a built-in AI agent — not a chatbot. The agent uses Gemini 2.5 Flash function calling with 5 autonomous tools: it captures leads to a database, sends real-time email notifications, looks up project details, checks service availability, and qualifies visitors — all without human intervention. Editorial-dark glass design, editorial typography, and production-grade architecture. Built with Next.js 16, Tailwind v4, Framer Motion, Supabase, and Nodemailer.

### Submission Tips
- Take high-quality screenshots (1440px desktop + 375px mobile)
- Tag: AI Agent, Portfolio, Next.js, Function Calling, Dark Mode, Glass UI
- Submit to 2-3 per week — don't spam all at once
- Include a screen recording of the agent calling tools in real-time

---

## Agent Setup (for email notifications)

### Gmail App Password (required for agent email notifications)
1. Go to your Google Account → Security
2. Make sure 2-Step Verification is ON
3. Go to App Passwords → Create one for "Mail"
4. Copy the 16-character password
5. Add to Vercel env vars:
   - `SMTP_USER=adelusidankunle@gmail.com`
   - `SMTP_PASS=<the-16-character-app-password>`
6. Redeploy

### Test the Agent
1. Go to `/chat` on the live site
2. Say: "my email is test@example.com, I need an automation pipeline"
3. Watch the agent tool indicator: "Saving your contact info..."
4. Check Supabase `leads` table — new row should appear
5. Check your Gmail — notification email should arrive

---

## Performance Tracking Setup

### Already Active
- **Vercel Analytics** — Real-time page views, unique visitors, top pages
- **Vercel Speed Insights** — Core Web Vitals (LCP, CLS, INP) per page

### To Set Up (Free)

#### Google Analytics 4
1. Go to https://analytics.google.com → Create property
2. Get the Measurement ID (starts with `G-`)
3. Add to Vercel: Settings → Environment Variables → `NEXT_PUBLIC_GA_ID` = `G-XXXXXXX`
4. Redeploy — GA4 will start tracking automatically

#### Google Search Console
1. Go to https://search.google.com/search-console
2. Add property → URL prefix → `https://adelusidankunle.vercel.app`
3. Verify via HTML tag → Copy the `content` value
4. Add to Vercel: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` = the content value
5. Redeploy → Google will verify
6. Submit sitemap: `https://adelusidankunle.vercel.app/sitemap.xml`

#### Bing Webmaster Tools (free, auto-imports from GSC)
1. Go to https://www.bing.com/webmasters
2. Import from Google Search Console (one click)

#### Social Preview Testing
- Test OG image: https://opengraph.xyz
- Test Twitter card: https://cards-dev.twitter.com/validator
- Test LinkedIn: https://www.linkedin.com/post-inspector/

---

## Social Media Launch Posts

### LinkedIn (~350 words, professional)

```
My portfolio doesn't just talk. It acts.

I built an AI agent inside my portfolio website. Not a chatbot — an agent with real tools and autonomous decision-making.

Here's what it does:

When you tell it your email, it doesn't just "note it down." It calls a function, writes your details to a database, and sends me an email notification — in real time. You see it happening: a small indicator shows "Saving your contact info..." while the tool executes.

When you ask about a project I've built, it doesn't guess from memory. It calls a lookup tool, searches my actual project data, and returns verified details — stack, metrics, approach, and a direct link to the case study.

When you ask about my availability, it calls a tool that returns my current engagement types, timezone, and contact info.

The architecture:

→ Gemini 2.5 Flash with function calling — the AI autonomously decides WHEN to use each tool
→ 5 server-side tools: lead capture, email notification, project lookup, service query, availability check
→ Event stream protocol — the UI shows real-time tool execution indicators
→ Supabase for lead persistence, Nodemailer for Gmail notifications
→ Next.js 16, Tailwind v4, Framer Motion, editorial-dark glass design

This isn't a demo. This is production infrastructure — the same architecture I ship to paying clients across the UK, US, Canada, and Dubai.

The AI agent on my portfolio IS the portfolio.

What I build for clients:
• AI agent systems with tool use and function calling
• LLM integrations (Claude, Gemini, GPT, DeepSeek)
• n8n/Make automation pipelines
• Voice agents (LiveKit + Cerebras)
• Full-stack AI products end-to-end

Available: Freelance · Contract · Remote Full-Time · Advisory

Talk to the agent → [SITE URL]/chat
See the full site → [SITE URL]

#AI #AIAgent #FunctionCalling #LLM #Portfolio #Automation #n8n #NextJS #BuildInPublic #OpenToWork #AIEngineer
```

### X Thread (7 tweets)

```
I built a portfolio website with an AI agent inside it.

Not a chatbot. An agent with 5 tools that takes real actions autonomously.

Here's the architecture ↓
```

```
1/ The problem with AI chatbots on portfolios:

They talk. That's it.

I wanted mine to ACT. Save leads. Send me emails. Look up project details. Check my availability. All without me lifting a finger.

So I built an agent with Gemini function calling.
```

```
2/ How it works:

Gemini 2.5 Flash receives the visitor's message + 5 tool declarations.

The AI DECIDES when to call a tool. No hardcoded rules. No regex hacks.

When it calls one, the server executes it and feeds the result back. Up to 5 rounds per turn.
```

```
3/ The 5 tools:

→ capture_lead — saves to Supabase + emails me
→ notify_dan — sends me a message from the visitor
→ lookup_project — searches my real case studies
→ list_services — returns what I offer
→ check_availability — engagement types, timezone, status

All server-side. Zero client-side hacks.
```

```
4/ The UX:

When a tool fires, the visitor sees a real-time indicator:

"Saving your contact info..."
"Looking up project details..."
"Notifying Dan..."

It's not a loading spinner. It's transparency — the visitor sees the agent working.

Event stream protocol: line-delimited JSON events.
```

```
5/ The stack:

→ Gemini 2.5 Flash function calling (free)
→ Nodemailer + Gmail SMTP (free)
→ Supabase (free tier)
→ Next.js 16 App Router
→ Tailwind v4 + Framer Motion
→ Editorial-dark glass design

Total recurring cost: $0.

The only paid thing is the Vercel domain (optional).
```

```
6/ This is exactly what I build for clients.

AI agent systems. LLM integration. Automation pipelines. Function calling. Production infrastructure.

20+ products shipped. 4+ countries. The portfolio IS the demo.

Talk to the agent: [SITE URL]/chat

DMs open for freelance, contract, and remote FT. 🤝
```

### Instagram Caption

```
Built an AI agent inside my portfolio. Not a chatbot — an agent.

It has 5 tools it can call autonomously:
→ Saves your contact info to a database
→ Sends me an email notification in real time
→ Looks up my actual project details
→ Returns my services and availability
→ Qualifies you as a lead — all through natural conversation

You see it happen. The UI shows "Saving your contact info..." while the tool executes.

Built with Gemini function calling, Supabase, Nodemailer, Next.js 16.

Total cost: $0.

This is what I build for clients. The portfolio IS the product demo.

Available for freelance · contract · remote · full-time worldwide.

Link in bio → talk to the agent

#AI #AIAgent #FunctionCalling #Portfolio #WebDesign #NextJS #LLM #Automation #BuildInPublic #TechNigeria #OpenToWork #GlassUI #DarkMode
```

### TikTok Script (30-45s)

```
[HOOK - 0-3s]
"I built a portfolio website with an AI agent that takes REAL actions."

[SHOW AGENT - 3-10s]
*Screen recording of chat — type "my email is test@example.com"*
"Watch what happens when I give it my email."

[TOOL INDICATOR - 10-18s]
*Show the "Saving your contact info..." indicator appearing*
"See that? That's not a loading screen. The AI just decided to call a function — it saved my details to a database and sent me an email. Autonomously."

[ARCHITECTURE - 18-28s]
*Quick flash of code or the tool list*
"5 tools. Function calling. Gemini 2.5 Flash. The AI decides when to act. No hardcoded rules."

[PROOF - 28-35s]
*Show Supabase table with the lead + Gmail notification*
"Database updated. Email received. Zero human intervention."

[CTA - 35-45s]
"I'm an AI Engineer. This is what I build for clients. 20+ products shipped across 4 countries. Link in bio to try it yourself."
```

### WhatsApp Status

```
Just shipped something wild 🔥

My portfolio website has an AI agent inside it — not a chatbot, an actual agent with tools.

Give it your email → it saves to a database + sends me an email notification. Autonomously.

Ask about my projects → it looks up real case study data with metrics.

5 tools. Gemini function calling. $0 cost.

Try it: [SITE URL]/chat

Available for freelance & remote work worldwide 🌍
```

---

## Post-Launch Checklist

### Infrastructure (completed 2026-04-14)
- [x] Set up Gmail App Password + add SMTP_USER/SMTP_PASS to Vercel
- [x] Test agent: email notification works (verified with Toke's lead)
- [ ] Test agent: verify Supabase lead persistence (after phone column fix + redeploy)
- [x] Set up Google Analytics 4 (G-LTYTGFFSD4 added to Vercel)
- [x] Set up CookieYes consent banner (initiated 2026-04-14)
- [x] Submit sitemap to Google Search Console (submitted 2026-04-14, status: "Couldn't fetch" — normal, retry in 3-5 days)
- [x] Submit to Bing Webmaster Tools (processing, up to 48h)
- [x] Test OG image on opengraph.xyz — PASS
- [x] Test Twitter card on cards-dev.x.com — PASS (summary_large_image)
- [x] Test LinkedIn post inspector — PASS

### SEO follow-ups
- [ ] Request indexing in GSC for: homepage, /about, /work, /chat, /services
- [ ] Re-check sitemap status in GSC (3-5 days after 2026-04-14)
- [ ] Submit sitemap in Bing Webmaster Tools → Sitemaps section

### Social launch
- [ ] Post on LinkedIn
- [ ] Post X thread
- [ ] Post on Instagram
- [ ] Post TikTok
- [ ] Update WhatsApp status

### Directory submissions
- [ ] Submit to Godly
- [ ] Submit to Product Hunt (AI agent as the product)
- [ ] Submit to Bestfolios
- [ ] Submit to Peerlist
- [ ] Write Dev.to / Hashnode article: "How I built an AI agent inside my portfolio"
