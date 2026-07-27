"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

interface Booking {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string;
  role: string;
  need: string;
  source: string | null;
  status: "pending" | "approved" | "declined";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  declined: number;
}

const inputClass =
  "w-full rounded-2xl border border-bone/12 bg-ink-2/70 px-4 py-3 text-base text-bone placeholder:text-bone/30 focus:border-accent/60 focus:outline-none";

function waLink(whatsapp: string): string {
  let d = whatsapp.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  // Nigerian local format (e.g. 08012345678) → international
  if (d.startsWith("0") && d.length === 11) d = "234" + d.slice(1);
  return `https://wa.me/${d}`;
}

const statusStyles: Record<Booking["status"], string> = {
  pending: "bg-accent/15 text-accent",
  approved: "bg-accent-2/15 text-accent-2",
  declined: "bg-bone/10 text-bone/50",
};

export function AdminBookings() {
  const [authed, setAuthed] = React.useState<boolean | null>(null);
  const [password, setPassword] = React.useState("");
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState<Record<string, string>>({});

  const loadData = React.useCallback(async () => {
    setError(null);
    const [listRes, statsRes] = await Promise.all([
      fetch("/api/bookings"),
      fetch("/api/bookings/stats"),
    ]);
    if (listRes.status === 401) {
      setAuthed(false);
      return;
    }
    if (!listRes.ok || !statsRes.ok) {
      setError("Could not load bookings. Check Supabase config and try again.");
      setAuthed(true);
      return;
    }
    const list = await listRes.json();
    const s = await statsRes.json();
    setBookings(list.bookings);
    setStats(s);
    setNotes(
      Object.fromEntries(
        (list.bookings as Booking[]).map((b) => [b.id, b.admin_notes ?? ""])
      )
    );
    setAuthed(true);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setLoginError(body?.error ?? "Login failed.");
      return;
    }
    setPassword("");
    await loadData();
  }

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
    setBookings([]);
    setStats(null);
  }

  async function patchBooking(
    id: string,
    body: { status?: Booking["status"]; adminNotes?: string }
  ) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error ?? "Update failed.");
      }
      const { booking } = await res.json();
      setBookings((prev) => prev.map((b) => (b.id === id ? booking : b)));
      const statsRes = await fetch("/api/bookings/stats");
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  if (authed === null) {
    return <p className="pt-24 text-center text-bone/50">Loading…</p>;
  }

  if (authed === false) {
    return (
      <div className="mx-auto mt-24 max-w-sm">
        <GlassCard className="p-6">
          <h1 className="mb-4 text-lg font-medium text-bone">Admin login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              autoFocus
              className={inputClass}
            />
            {loginError && (
              <p role="alert" className="text-sm text-accent">
                {loginError}
              </p>
            )}
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-medium text-bone">Bookings</h1>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Log out
        </Button>
      </div>

      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              ["Total", stats.total],
              ["Pending", stats.pending],
              ["Approved", stats.approved],
              ["Declined", stats.declined],
            ] as const
          ).map(([label, value]) => (
            <GlassCard key={label} variant="light" className="p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone/50">
                {label}
              </p>
              <p className="mt-1 text-2xl font-medium text-bone">{value}</p>
            </GlassCard>
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="mb-6 text-sm text-accent">
          {error}
        </p>
      )}

      {bookings.length === 0 ? (
        <p className="py-16 text-center text-bone/50">No submissions yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <GlassCard key={b.id} className="p-5 sm:p-6">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-medium text-bone">{b.full_name}</h2>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wider",
                    statusStyles[b.status]
                  )}
                >
                  {b.status}
                </span>
                {b.source && (
                  <span className="rounded-full bg-accent-3/15 px-3 py-1 font-mono text-[11px] tracking-wider text-accent-3">
                    {b.source}
                  </span>
                )}
                <span className="ml-auto font-mono text-[11px] text-bone/40">
                  {new Date(b.created_at).toLocaleString()}
                </span>
              </div>

              <p className="mb-1 text-sm text-bone/70">{b.role}</p>
              <p className="mb-4 whitespace-pre-wrap text-bone/90">{b.need}</p>

              <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                <a
                  href={`mailto:${b.email}`}
                  className="text-accent-3 hover:underline"
                >
                  {b.email}
                </a>
                <a
                  href={waLink(b.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-2 hover:underline"
                >
                  WhatsApp: {b.whatsapp}
                </a>
              </div>

              {b.status === "pending" && (
                <div className="mb-4 flex gap-3">
                  <Button
                    size="sm"
                    disabled={busyId === b.id}
                    onClick={() => patchBooking(b.id, { status: "approved" })}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busyId === b.id}
                    onClick={() => patchBooking(b.id, { status: "declined" })}
                  >
                    Decline
                  </Button>
                </div>
              )}

              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label
                    htmlFor={`notes-${b.id}`}
                    className="mb-1 block font-mono text-[11px] uppercase tracking-[0.2em] text-bone/50"
                  >
                    Notes
                  </label>
                  <textarea
                    id={`notes-${b.id}`}
                    rows={2}
                    value={notes[b.id] ?? ""}
                    onChange={(e) =>
                      setNotes((prev) => ({ ...prev, [b.id]: e.target.value }))
                    }
                    placeholder="Private notes about this person…"
                    className={inputClass}
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={
                    busyId === b.id || (notes[b.id] ?? "") === (b.admin_notes ?? "")
                  }
                  onClick={() =>
                    patchBooking(b.id, { adminNotes: notes[b.id] ?? "" })
                  }
                >
                  Save
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
