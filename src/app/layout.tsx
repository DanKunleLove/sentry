import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "opsz"],
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://adelusidankunle.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Adelusi Dan Kunle — AI Engineer · Automation Architect · LLM Specialist",
    template: "%s · Adelusi Dan Kunle",
  },
  description:
    "AI Engineer, LLM Specialist, and Automation Architect shipping production AI products, agent systems, and creative-AI pipelines for international clients. Available for freelance, contract, remote and full-time roles worldwide.",
  keywords: [
    "AI Engineer",
    "LLM Specialist",
    "Automation Architect",
    "AI Engineer remote",
    "n8n automation",
    "LLM integration contractor",
    "Gemini",
    "Claude",
    "Mabi Labs",
    "Adelusi Dan Kunle",
    "Dan Kunle",
    "AI Trainer",
    "Outlier",
    "Mercor",
    "Scale AI",
    "Creative AI",
    "AI video",
    "full-stack AI developer",
    "hire AI engineer",
    "AI automation freelancer",
    "n8n consultant",
    "AI developer for hire",
    "AI agent developer",
    "remote AI engineer",
    "freelance LLM engineer",
    "AI consultant remote",
  ],
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  authors: [{ name: "Adelusi Dan Kunle", url: SITE_URL }],
  creator: "Adelusi Dan Kunle",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Adelusi Dan Kunle",
    title:
      "Adelusi Dan Kunle — AI Engineer · Automation Architect · LLM Specialist",
    description:
      "Shipping production AI products, agent systems, and automation pipelines to clients across UK, US, Canada, Dubai, and beyond. Open to freelance, contract, remote and full-time roles.",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@dankunle_01",
    title: "Adelusi Dan Kunle — AI Engineer · LLM Specialist",
    description:
      "Shipping production AI to clients across multiple countries. Available worldwide.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: SITE_URL },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Adelusi Dan Kunle",
  alternateName: "Dan Kunle",
  jobTitle: "AI Engineer · Automation Architect · LLM Specialist",
  url: SITE_URL,
  image: `${SITE_URL}/images/adk-portrait.png`,
  worksFor: {
    "@type": "Organization",
    name: "Mabi Labs",
    url: "https://mabilabs.ai",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Federal University Oye Ekiti",
  },
  sameAs: [
    "https://github.com/DanKunleLove",
    "https://www.linkedin.com/in/dan-adelusi-057733322",
    "https://x.com/dankunle_01",
    "https://www.tiktok.com/@dkl612",
    "https://www.instagram.com/dankunleai",
  ],
  knowsAbout: [
    "Large Language Models",
    "LLM Integration",
    "AI Automation",
    "n8n",
    "Next.js",
    "Supabase",
    "FastAPI",
    "RLHF",
    "Prompt Engineering",
    "Generative AI",
    "Voice Agents",
    "Creative AI Production",
  ],
  email: "mailto:adelusidankunle@gmail.com",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${geist.variable} ${jetbrains.variable}`}
    >
      <body className="bg-ink text-bone">
        <Script
          id="cookieyes"
          src="https://cdn-cookieyes.com/client_data/35729f8abf8513f5456e6a5d/script.js"
          strategy="beforeInteractive"
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <GoogleAnalytics />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
