import "server-only";
import { availability, session } from "@/content/sessions";
import { getFreeBusy, isCalendarConfigured } from "@/lib/calendar";
import { getAdminSupabase } from "@/lib/supabase";

/**
 * The availability engine: Dan's configured WAT windows
 *   minus Google Calendar busy periods
 *   minus slots already claimed (pending/approved) in Supabase.
 * All slot times are ISO UTC strings; clients convert for display.
 */

const MS_PER_MIN = 60_000;
const MS_PER_DAY = 24 * 60 * MS_PER_MIN;
const OFFSET_MS = availability.utcOffsetMinutes * MS_PER_MIN;

function parseHM(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

/** Generate every candidate slot start (UTC ms) from the WAT windows. */
function candidateSlots(now: Date): number[] {
  const minStart = now.getTime() + availability.minNoticeHours * 60 * MS_PER_MIN;
  const slots: number[] = [];

  for (let i = 0; i <= availability.horizonDays; i++) {
    // Shift into WAT wall-clock, then read the calendar date with UTC accessors.
    const wat = new Date(now.getTime() + i * MS_PER_DAY + OFFSET_MS);
    const weekday = wat.getUTCDay();
    const dayUtcMidnight = Date.UTC(
      wat.getUTCFullYear(),
      wat.getUTCMonth(),
      wat.getUTCDate()
    );

    for (const w of availability.windows) {
      if (!(w.days as readonly number[]).includes(weekday)) continue;
      const startMin = parseHM(w.start);
      const endMin = parseHM(w.end);
      for (
        let t = startMin;
        t + session.durationMinutes <= endMin;
        t += availability.slotIntervalMinutes
      ) {
        // WAT wall time → real UTC instant
        const startMs = dayUtcMidnight + t * MS_PER_MIN - OFFSET_MS;
        if (startMs >= minStart) slots.push(startMs);
      }
    }
  }
  return slots.sort((a, b) => a - b);
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

/** Open slot starts (ISO UTC) for the booking horizon. */
export async function getOpenSlots(): Promise<string[]> {
  const now = new Date();
  let slots = candidateSlots(now);
  const durMs = session.durationMinutes * MS_PER_MIN;

  // Subtract Google Calendar busy periods. Fail open (with a log) so the
  // booking page keeps working before OAuth is configured — the approval
  // gate catches any clash.
  if (isCalendarConfigured()) {
    try {
      const { busy } = await getFreeBusy(availability.horizonDays + 1);
      const busyRanges = busy.map((b) => [
        new Date(b.start).getTime(),
        new Date(b.end).getTime(),
      ]);
      slots = slots.filter(
        (s) => !busyRanges.some(([bs, be]) => overlaps(s, s + durMs, bs, be))
      );
    } catch (err) {
      console.error("[availability] freeBusy failed — showing config slots only:", err);
    }
  } else {
    console.warn("[availability] Google Calendar not configured — using config windows only.");
  }

  // Subtract slots already claimed in Supabase.
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    const { data, error } = await getAdminSupabase()
      .from("bookings")
      .select("slot_start, slot_end")
      .in("status", ["pending", "approved"])
      .gte("slot_start", now.toISOString());
    if (error) {
      console.error("[availability] booked-slots query failed:", error);
    } else {
      const taken = (data ?? [])
        .filter((b) => b.slot_start)
        .map((b) => [
          new Date(b.slot_start).getTime(),
          new Date(b.slot_end ?? b.slot_start).getTime() || 0,
        ]);
      slots = slots.filter(
        (s) =>
          !taken.some(([ts, te]) => overlaps(s, s + durMs, ts, Math.max(te, ts + durMs)))
      );
    }
  }

  return slots.map((s) => new Date(s).toISOString());
}

/** True when `slotStart` (ISO) is currently a legitimate open slot. */
export async function isSlotOpen(slotStart: string): Promise<boolean> {
  const target = new Date(slotStart).toISOString();
  const open = await getOpenSlots();
  return open.includes(target);
}
