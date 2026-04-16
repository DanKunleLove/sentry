import "server-only";

/**
 * Google Calendar integration for Dan's AI twin.
 * Uses OAuth2 refresh token flow — no user login required.
 * Requires: GOOGLE_CALENDAR_CLIENT_ID, GOOGLE_CALENDAR_CLIENT_SECRET, GOOGLE_CALENDAR_REFRESH_TOKEN
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const CALENDAR_ID = "primary"; // Dan's main calendar

let cachedToken: { access_token: string; expires_at: number } | null = null;

/** Check if calendar integration is configured. */
export function isCalendarConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CALENDAR_CLIENT_ID &&
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET &&
    process.env.GOOGLE_CALENDAR_REFRESH_TOKEN
  );
}

/** Get a fresh access token using the refresh token. */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expires_at - 60_000) {
    return cachedToken.access_token;
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CALENDAR_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to refresh Google token: ${err}`);
  }

  const data = await res.json();
  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.access_token;
}

/** Fetch free/busy slots for the next N days. Returns busy periods. */
export async function getFreeBusy(days = 7): Promise<{
  busy: { start: string; end: string }[];
  timeZone: string;
}> {
  const token = await getAccessToken();
  const now = new Date();
  const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const res = await fetch(`${CALENDAR_API}/freeBusy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: now.toISOString(),
      timeMax: end.toISOString(),
      timeZone: "Africa/Lagos",
      items: [{ id: CALENDAR_ID }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Calendar freeBusy failed: ${err}`);
  }

  const data = await res.json();
  const busy = data.calendars?.[CALENDAR_ID]?.busy ?? [];
  return { busy, timeZone: "Africa/Lagos (WAT, UTC+1)" };
}

/** Create a calendar event and invite the visitor. */
export async function createMeeting(opts: {
  summary: string;
  description?: string;
  startTime: string; // ISO 8601
  durationMinutes?: number;
  attendeeEmail: string;
}): Promise<{ eventId: string; htmlLink: string }> {
  const token = await getAccessToken();
  const duration = opts.durationMinutes ?? 30;
  const start = new Date(opts.startTime);
  const end = new Date(start.getTime() + duration * 60 * 1000);

  const res = await fetch(`${CALENDAR_API}/calendars/${CALENDAR_ID}/events?sendUpdates=all`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: opts.summary,
      description: opts.description || "Meeting scheduled via Dan's AI twin",
      start: { dateTime: start.toISOString(), timeZone: "Africa/Lagos" },
      end: { dateTime: end.toISOString(), timeZone: "Africa/Lagos" },
      attendees: [
        { email: opts.attendeeEmail },
        { email: "adelusidankunle@gmail.com" },
      ],
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [{ method: "email", minutes: 30 }],
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Calendar event creation failed: ${err}`);
  }

  const event = await res.json();
  return {
    eventId: event.id,
    htmlLink: event.htmlLink,
  };
}
