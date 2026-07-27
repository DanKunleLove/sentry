"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/cn";

const inputClass =
  "w-full rounded-2xl border border-bone/12 bg-ink-2/70 px-4 py-3.5 text-base text-bone placeholder:text-bone/30 transition-colors duration-300 focus:border-accent/60 focus:outline-none";

const labelClass =
  "mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-bone/50";

interface Availability {
  slots: string[]; // ISO UTC
  durationMinutes: number;
  sessionName: string;
}

interface DayGroup {
  key: string; // YYYY-MM-DD in the visitor's timezone
  weekday: string; // "Mon"
  day: string; // "3"
  month: string; // "Aug"
  slots: string[];
}

function groupByLocalDay(slots: string[]): DayGroup[] {
  const groups = new Map<string, DayGroup>();
  for (const iso of slots) {
    const d = new Date(iso);
    const key = d.toLocaleDateString("en-CA"); // YYYY-MM-DD, local tz
    let g = groups.get(key);
    if (!g) {
      g = {
        key,
        weekday: d.toLocaleDateString("en-GB", { weekday: "short" }),
        day: d.toLocaleDateString("en-GB", { day: "numeric" }),
        month: d.toLocaleDateString("en-GB", { month: "short" }),
        slots: [],
      };
      groups.set(key, g);
    }
    g.slots.push(iso);
  }
  return [...groups.values()];
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function slotSummary(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

type Step = "time" | "details" | "done";

export function BookingWizard() {
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();
  const source = (
    searchParams.get("src") ??
    searchParams.get("utm_source") ??
    ""
  ).slice(0, 60);

  const [step, setStep] = React.useState<Step>("time");
  const [availability, setAvailability] = React.useState<Availability | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [dayKey, setDayKey] = React.useState<string | null>(null);
  const [slot, setSlot] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const visitorTz = React.useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  const loadSlots = React.useCallback(async () => {
    setLoadError(null);
    setAvailability(null);
    try {
      const res = await fetch("/api/availability");
      if (!res.ok) throw new Error();
      const data: Availability = await res.json();
      setAvailability(data);
      setDayKey((prev) => {
        const days = groupByLocalDay(data.slots);
        return prev && days.some((d) => d.key === prev)
          ? prev
          : (days[0]?.key ?? null);
      });
    } catch {
      setLoadError("Couldn't load available times. Refresh to try again.");
    }
  }, []);

  React.useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const days = React.useMemo(
    () => (availability ? groupByLocalDay(availability.slots) : []),
    [availability]
  );
  const activeDay = days.find((d) => d.key === dayKey) ?? null;

  function pickSlot(iso: string) {
    setSlot(iso);
    setSubmitError(null);
    setStep("details");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!slot) return;
    setSubmitError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      fullName: String(form.get("fullName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      whatsapp: String(form.get("whatsapp") ?? "").trim(),
      social: String(form.get("social") ?? "").trim(),
      role: String(form.get("role") ?? "").trim(),
      need: String(form.get("need") ?? "").trim(),
      wantsResources: form.get("wantsResources") === "on",
      slotStart: slot,
      visitorTz,
      source,
      website: String(form.get("website") ?? ""), // honeypot
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 409) {
        setSubmitting(false);
        setSlot(null);
        setStep("time");
        setSubmitError("That time was just taken — pick another slot.");
        await loadSlots();
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Something went wrong. Please try again.");
      }
      setStep("done");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setSubmitting(false);
    }
  }

  const motionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, x: 24 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -24 },
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <GlassCard className="overflow-hidden p-6 sm:p-8">
      <AnimatePresence mode="wait">
        {step === "time" && (
          <motion.div key="time" {...motionProps}>
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <h2 className="text-lg font-medium text-bone">Pick a time</h2>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone/40">
                {visitorTz.replace(/_/g, " ")}
              </span>
            </div>

            {submitError && (
              <p role="alert" className="mb-4 text-sm text-accent">
                {submitError}
              </p>
            )}

            {loadError ? (
              <div className="py-10 text-center">
                <p className="mb-4 text-bone/70">{loadError}</p>
                <Button variant="ghost" size="sm" onClick={loadSlots}>
                  Retry
                </Button>
              </div>
            ) : !availability ? (
              <div className="space-y-4 py-2" aria-label="Loading times">
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 w-14 animate-pulse rounded-2xl bg-bone/6"
                    />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-11 animate-pulse rounded-full bg-bone/6"
                    />
                  ))}
                </div>
              </div>
            ) : days.length === 0 ? (
              <p className="py-10 text-center text-bone/60">
                No open slots in the next two weeks. Check back soon — new times
                open up regularly.
              </p>
            ) : (
              <>
                <div
                  className="mb-6 flex gap-2 overflow-x-auto pb-2"
                  role="tablist"
                  aria-label="Available days"
                >
                  {days.map((d) => (
                    <button
                      key={d.key}
                      role="tab"
                      aria-selected={d.key === dayKey}
                      onClick={() => setDayKey(d.key)}
                      className={cn(
                        "flex min-w-[3.5rem] shrink-0 flex-col items-center rounded-2xl border px-3 py-2.5 transition-colors duration-300",
                        d.key === dayKey
                          ? "border-accent/60 bg-accent/10 text-bone"
                          : "border-bone/12 text-bone/60 hover:border-bone/28"
                      )}
                    >
                      <span className="font-mono text-[10px] uppercase tracking-widest">
                        {d.weekday}
                      </span>
                      <span className="text-lg font-medium">{d.day}</span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-bone/40">
                        {d.month}
                      </span>
                    </button>
                  ))}
                </div>

                {activeDay && (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {activeDay.slots.map((iso) => (
                      <button
                        key={iso}
                        onClick={() => pickSlot(iso)}
                        className="rounded-full border border-bone/12 px-3 py-2.5 font-mono text-sm text-bone/80 transition-colors duration-300 hover:border-accent/60 hover:bg-accent/10 hover:text-bone"
                      >
                        {timeLabel(iso)}
                      </button>
                    ))}
                  </div>
                )}

                <p className="mt-6 text-center text-sm text-bone/40">
                  30 minutes · Google Meet · shown in your local time
                </p>
              </>
            )}
          </motion.div>
        )}

        {step === "details" && slot && (
          <motion.div key="details" {...motionProps}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone/50">
                  {slotSummary(slot)}
                </p>
                <p className="text-lg font-medium text-bone">
                  {timeLabel(slot)} · 30 min
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setStep("time")}
              >
                Change time
              </Button>
            </div>

            <form onSubmit={handleSubmit}>
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
                  <label htmlFor="social" className={labelClass}>
                    Your main social profile *
                  </label>
                  <input
                    id="social"
                    name="social"
                    type="text"
                    required
                    minLength={2}
                    maxLength={300}
                    placeholder="Instagram, TikTok, LinkedIn or X link"
                    className={inputClass}
                  />
                  <p className="mt-1.5 text-xs text-bone/40">
                    I review every request personally — this helps me prepare
                    for you.
                  </p>
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
                    What do you want from the session? *
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

                <label className="flex cursor-pointer items-start gap-3 text-sm text-bone/70">
                  <input
                    type="checkbox"
                    name="wantsResources"
                    defaultChecked
                    className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
                  />
                  Send me the free resource pack for my use case after the
                  session
                </label>

                {submitError && (
                  <p role="alert" className="text-sm text-accent">
                    {submitError}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? "Booking…" : "Request this session"}
                </Button>

                <p className="text-center text-sm text-bone/50">
                  You&rsquo;ll get an instant email receipt, then your Google
                  Meet link once I confirm — usually within a few hours.
                </p>
              </div>
            </form>
          </motion.div>
        )}

        {step === "done" && slot && (
          <motion.div key="done" {...motionProps} className="py-8 text-center">
            <div
              aria-hidden="true"
              className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent-2/15 text-2xl"
            >
              ✓
            </div>
            <h2 className="mb-3 text-xl font-medium text-bone">
              Request sent
            </h2>
            <p className="mx-auto mb-2 max-w-sm text-bone/70">
              {slotSummary(slot)} at {timeLabel(slot)} is penciled in. Check
              your inbox — the receipt is already there, and your Google Meet
              link lands as soon as I confirm.
            </p>
            <p className="text-sm text-bone/40">
              (No email in a few minutes? Check spam.)
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
