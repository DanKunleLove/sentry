"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

interface ActionResult {
  action: "approve" | "decline";
  alreadyDone: boolean;
  booking: {
    fullName: string;
    slotStart: string | null;
    meetLink: string | null;
    status: string;
  };
}

/**
 * Confirmation step for one-click email actions. The emailed link lands here;
 * the real action fires only on the button press (POST) — so inbox link
 * scanners can't approve a session by prefetching the URL.
 */
export function ActionConfirm({ token }: { token: string }) {
  const [state, setState] = React.useState<
    | { phase: "confirm" }
    | { phase: "working" }
    | { phase: "done"; result: ActionResult }
    | { phase: "error"; message: string }
  >(token ? { phase: "confirm" } : { phase: "error", message: "Missing link token." });

  async function run() {
    setState({ phase: "working" });
    try {
      const res = await fetch("/api/bookings/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error ?? "Action failed. Try the admin panel.");
      }
      setState({ phase: "done", result: body as ActionResult });
    } catch (err) {
      setState({
        phase: "error",
        message:
          err instanceof Error ? err.message : "Action failed. Try the admin panel.",
      });
    }
  }

  return (
    <GlassCard className="p-6 sm:p-8">
      {state.phase === "confirm" && (
        <>
          <h1 className="mb-3 text-xl font-medium text-bone">
            Confirm booking action
          </h1>
          <p className="mb-6 text-bone/70">
            Press the button to apply this action. The applicant is emailed
            automatically — approvals also create the calendar event and Google
            Meet link.
          </p>
          <Button onClick={run} className="w-full">
            Apply action
          </Button>
        </>
      )}

      {state.phase === "working" && (
        <p className="py-8 text-center text-bone/70">Working…</p>
      )}

      {state.phase === "done" && (
        <>
          <h1 className="mb-3 text-xl font-medium text-bone">
            {state.result.action === "approve" ? "Session approved ✓" : "Request declined"}
          </h1>
          <p className="mb-2 text-bone/70">
            {state.result.alreadyDone
              ? "This one was already handled — nothing sent twice."
              : state.result.action === "approve"
                ? `${state.result.booking.fullName} has been confirmed and emailed.`
                : `${state.result.booking.fullName} has been notified with a rebook link.`}
          </p>
          {state.result.booking.meetLink && (
            <p className="text-sm text-bone/50">
              Meet link:{" "}
              <a
                href={state.result.booking.meetLink}
                className="text-accent-3 hover:underline"
              >
                {state.result.booking.meetLink}
              </a>
            </p>
          )}
        </>
      )}

      {state.phase === "error" && (
        <>
          <h1 className="mb-3 text-xl font-medium text-bone">
            Couldn&rsquo;t apply that
          </h1>
          <p role="alert" className="mb-4 text-accent">
            {state.message}
          </p>
          <p className="text-sm text-bone/50">
            You can always handle it from{" "}
            <a href="/admin/bookings" className="text-accent-3 hover:underline">
              the admin panel
            </a>
            .
          </p>
        </>
      )}
    </GlassCard>
  );
}
