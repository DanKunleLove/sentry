/**
 * Booking session config — the single source of truth for what /book offers
 * and when Dan is bookable. Edit this file to change hours; no code changes needed.
 */

export const session = {
  slug: "free-setup",
  name: "Free 1:1 AI Setup Session",
  durationMinutes: 30,
  description:
    "A free 30-minute video call. Bring your workflow or problem — leave with a concrete AI setup plan.",
} as const;

/**
 * Availability rules. All wall-clock times are West Africa Time (WAT, UTC+1 —
 * no DST, fixed offset). Visitors see slots converted to their own timezone.
 */
export const availability = {
  timeZone: "Africa/Lagos",
  utcOffsetMinutes: 60,
  /** Bookable windows per weekday (0 = Sunday … 6 = Saturday), "HH:MM" WAT. */
  windows: [
    { days: [1, 2, 3, 4, 5], start: "17:00", end: "21:00" }, // Mon–Fri evenings
    { days: [6], start: "10:00", end: "16:00" }, // Saturday
  ],
  /** Minutes between slot start times. */
  slotIntervalMinutes: 30,
  /** Earliest bookable slot: now + this many hours. */
  minNoticeHours: 12,
  /** How far ahead people can book. */
  horizonDays: 14,
} as const;
