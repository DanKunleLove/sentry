"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

const inputClass =
  "w-full rounded-2xl border border-bone/12 bg-ink-2/70 px-4 py-3.5 text-base text-bone placeholder:text-bone/30 transition-colors duration-300 focus:border-accent/60 focus:outline-none";

const labelClass =
  "mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-bone/50";

export function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Content-pillar attribution: links in bios/videos carry ?src=tiktok-automation etc.
  const source = searchParams.get("src") ?? searchParams.get("utm_source") ?? "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      fullName: String(form.get("fullName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      whatsapp: String(form.get("whatsapp") ?? "").trim(),
      role: String(form.get("role") ?? "").trim(),
      need: String(form.get("need") ?? "").trim(),
      source: source.slice(0, 60),
      website: String(form.get("website") ?? ""), // honeypot
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Something went wrong. Please try again.");
      }
      router.push("/?booked=1");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setSubmitting(false);
    }
  }

  return (
    <GlassCard className="p-6 sm:p-8">
      <form onSubmit={handleSubmit} noValidate={false}>
        {/* Honeypot — hidden from humans, bots fill it */}
        <div aria-hidden="true" className="absolute -left-[9999px] top-0">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="fullName" className={labelClass}>
              Full name *
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
              placeholder="Your full name"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>
              Email address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={200}
              autoComplete="email"
              placeholder="you@company.com"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="whatsapp" className={labelClass}>
              WhatsApp number *
            </label>
            <input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              required
              minLength={7}
              maxLength={30}
              autoComplete="tel"
              placeholder="+234 801 234 5678"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="role" className={labelClass}>
              What do you do? *
            </label>
            <input
              id="role"
              name="role"
              type="text"
              required
              minLength={2}
              maxLength={160}
              placeholder="e.g. CEO of a logistics company"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="need" className={labelClass}>
              What do you need help with? *
            </label>
            <textarea
              id="need"
              name="need"
              required
              minLength={10}
              maxLength={2000}
              rows={4}
              placeholder="e.g. I want to automate my customer support using AI"
              className={inputClass}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-accent">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="w-full"
          >
            {submitting ? "Submitting…" : "Request my free session"}
          </Button>

          <p className="text-center text-sm text-bone/50">
            I review every request personally. You&rsquo;ll hear back within 48
            hours.
          </p>
        </div>
      </form>
    </GlassCard>
  );
}
