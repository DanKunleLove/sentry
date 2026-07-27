import "server-only";
import { getAdminSupabase } from "@/lib/supabase";
import { createMeeting, isCalendarConfigured } from "@/lib/calendar";
import {
  bookingApprovedEmail,
  bookingDeclinedEmail,
  resourcesEmail,
} from "@/lib/email";
import { packForSource } from "@/content/resources";
import { session } from "@/content/sessions";
import { site } from "@/lib/site";

/**
 * Booking state transitions, shared by the admin panel, the one-click
 * email actions, and the resources cron. Each function is idempotent:
 * acting on a booking that already left `pending` reports what happened
 * instead of double-firing emails or calendar events.
 */

export interface BookingRow {
  id: string;
  full_name: string;
  email: string;
  status: "pending" | "approved" | "declined";
  slot_start: string | null;
  slot_end: string | null;
  visitor_tz: string | null;
  source: string | null;
  wants_resources: boolean;
  resources_sent_at: string | null;
  calendar_event_id: string | null;
  meet_link: string | null;
}

export type ActionResult =
  | { ok: true; booking: BookingRow; alreadyDone?: boolean }
  | { ok: false; error: string; status: number };

const BOOKING_FIELDS =
  "id, full_name, email, status, slot_start, slot_end, visitor_tz, source, wants_resources, resources_sent_at, calendar_event_id, meet_link";

async function getBooking(id: string): Promise<BookingRow | null> {
  const { data, error } = await getAdminSupabase()
    .from("bookings")
    .select(BOOKING_FIELDS)
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as BookingRow;
}

/** Approve: create the calendar event + Meet link, confirm to the applicant. */
export async function approveBooking(id: string): Promise<ActionResult> {
  const booking = await getBooking(id);
  if (!booking) return { ok: false, error: "Booking not found.", status: 404 };
  if (booking.status === "approved") return { ok: true, booking, alreadyDone: true };
  if (booking.status !== "pending") {
    return { ok: false, error: `Booking was already ${booking.status}.`, status: 409 };
  }

  let calendarEventId: string | null = null;
  let meetLink: string | null = null;
  if (booking.slot_start && isCalendarConfigured()) {
    try {
      const event = await createMeeting({
        summary: `${session.name} — ${booking.full_name}`,
        description: `Booked via ${site.url}/book`,
        startTime: booking.slot_start,
        durationMinutes: session.durationMinutes,
        attendeeEmail: booking.email,
      });
      calendarEventId = event.eventId;
      meetLink = event.meetLink;
    } catch (err) {
      // Approve anyway — the calendar invite can be sent manually; don't lose the lead.
      console.error("[booking-actions] calendar event failed:", err);
    }
  }

  const { data: updated, error } = await getAdminSupabase()
    .from("bookings")
    .update({
      status: "approved",
      calendar_event_id: calendarEventId,
      meet_link: meetLink,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "pending") // guard against a concurrent action
    .select(BOOKING_FIELDS)
    .single();

  if (error || !updated) {
    console.error("[booking-actions] approve update failed:", error);
    return { ok: false, error: "Could not update booking.", status: 500 };
  }

  await bookingApprovedEmail({
    fullName: booking.full_name,
    email: booking.email,
    slotStart: booking.slot_start,
    visitorTz: booking.visitor_tz,
    meetLink,
  });

  return { ok: true, booking: updated as BookingRow };
}

/** Decline: free the slot and invite them to pick another time. */
export async function declineBooking(id: string): Promise<ActionResult> {
  const booking = await getBooking(id);
  if (!booking) return { ok: false, error: "Booking not found.", status: 404 };
  if (booking.status === "declined") return { ok: true, booking, alreadyDone: true };
  if (booking.status !== "pending") {
    return { ok: false, error: `Booking was already ${booking.status}.`, status: 409 };
  }

  const { data: updated, error } = await getAdminSupabase()
    .from("bookings")
    .update({ status: "declined", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending")
    .select(BOOKING_FIELDS)
    .single();

  if (error || !updated) {
    console.error("[booking-actions] decline update failed:", error);
    return { ok: false, error: "Could not update booking.", status: 500 };
  }

  await bookingDeclinedEmail({
    fullName: booking.full_name,
    email: booking.email,
    rebookUrl: `${site.url}/book`,
  });

  return { ok: true, booking: updated as BookingRow };
}

/** Send the post-session resource pack (idempotent via resources_sent_at). */
export async function sendBookingResources(id: string): Promise<ActionResult> {
  const booking = await getBooking(id);
  if (!booking) return { ok: false, error: "Booking not found.", status: 404 };
  if (booking.resources_sent_at) return { ok: true, booking, alreadyDone: true };
  if (booking.status !== "approved") {
    return { ok: false, error: "Resources only go to approved sessions.", status: 409 };
  }

  const pack = packForSource(booking.source);
  const sent = await resourcesEmail({
    fullName: booking.full_name,
    email: booking.email,
    packTitle: pack.title,
    packUrl: pack.url,
    packBlurb: pack.blurb,
  });
  if (!sent) return { ok: false, error: "Email send failed.", status: 500 };

  const { data: updated, error } = await getAdminSupabase()
    .from("bookings")
    .update({
      resources_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(BOOKING_FIELDS)
    .single();

  if (error || !updated) {
    console.error("[booking-actions] resources stamp failed:", error);
    return { ok: false, error: "Sent, but could not record it.", status: 500 };
  }

  return { ok: true, booking: updated as BookingRow };
}
