import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminSupabase } from "@/lib/supabase";
import { checkRateLimit, ipFromRequest } from "@/lib/ratelimit";
import { isAdminRequest } from "@/lib/admin-auth";
import { notifyBookingEmail, bookingReceivedEmail } from "@/lib/email";
import { appendBookingRow } from "@/lib/sheets";
import { isSlotOpen } from "@/lib/availability";
import { createActionToken } from "@/lib/booking-tokens";
import { session } from "@/content/sessions";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BookingSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(200),
  whatsapp: z.string().min(7).max(30),
  social: z.string().min(2).max(300),
  role: z.string().min(2).max(160),
  need: z.string().min(10).max(2000),
  slotStart: z.string().datetime({ offset: true }),
  visitorTz: z.string().max(60).optional(),
  wantsResources: z.boolean().optional(),
  source: z.string().max(60).optional(),
  website: z.string().optional(), // honeypot
});

export async function POST(req: NextRequest) {
  // Rate limit — 5/hour/IP
  const ip = ipFromRequest(req);
  const rl = checkRateLimit(`booking:${ip}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again in an hour." },
      { status: 429 }
    );
  }

  let data;
  try {
    data = BookingSchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "Please fill in all required fields correctly." },
      { status: 400 }
    );
  }

  // Honeypot filled → pretend success, save nothing.
  if (data.website) {
    return NextResponse.json({ ok: true });
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.warn("[bookings] Supabase not configured — dropping:", data.email);
    return NextResponse.json({
      ok: true,
      warning: "Supabase not configured; booking not persisted.",
    });
  }

  // The slot must still be a legitimately open one (working hours, notice,
  // calendar free, not claimed). Guards against stale UIs and crafted payloads.
  const slotStart = new Date(data.slotStart).toISOString();
  if (!(await isSlotOpen(slotStart))) {
    return NextResponse.json(
      { error: "That time was just taken. Please pick another slot." },
      { status: 409 }
    );
  }
  const slotEnd = new Date(
    new Date(slotStart).getTime() + session.durationMinutes * 60_000
  ).toISOString();

  const supabase = getAdminSupabase();
  const { data: inserted, error } = await supabase
    .from("bookings")
    .insert({
      full_name: data.fullName,
      email: data.email,
      whatsapp: data.whatsapp,
      social: data.social,
      role: data.role,
      need: data.need,
      source: data.source || null,
      slot_start: slotStart,
      slot_end: slotEnd,
      visitor_tz: data.visitorTz || null,
      wants_resources: data.wantsResources ?? false,
      status: "pending",
    })
    .select("id, created_at")
    .single();

  if (error) {
    // 23505 = unique violation on the active-slot index → race lost
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "That time was just taken. Please pick another slot." },
        { status: 409 }
      );
    }
    console.error("[bookings] insert error", error);
    return NextResponse.json(
      { error: "Could not save your request. Please try again." },
      { status: 500 }
    );
  }

  // One-click approve/decline links for Dan's email (confirm page, not direct GET).
  const approveToken = createActionToken(inserted.id, "approve");
  const declineToken = createActionToken(inserted.id, "decline");
  const actions =
    approveToken && declineToken
      ? {
          approveUrl: `${site.url}/booking/action?token=${approveToken}`,
          declineUrl: `${site.url}/booking/action?token=${declineToken}`,
        }
      : undefined;

  // Notify Dan + instant receipt to the visitor + Sheets. Failures are logged, never block.
  await Promise.allSettled([
    notifyBookingEmail(
      {
        fullName: data.fullName,
        email: data.email,
        whatsapp: data.whatsapp,
        social: data.social,
        role: data.role,
        need: data.need,
        source: data.source,
        slotStart,
        visitorTz: data.visitorTz,
        wantsResources: data.wantsResources,
      },
      actions
    ),
    bookingReceivedEmail({
      fullName: data.fullName,
      email: data.email,
      slotStart,
      visitorTz: data.visitorTz,
    }),
    appendBookingRow({
      createdAt: inserted.created_at,
      fullName: data.fullName,
      email: data.email,
      whatsapp: data.whatsapp,
      role: data.role,
      need: data.need,
      status: "pending",
      source: data.source ?? "",
      social: data.social,
      slotStart,
    }),
  ]);

  return NextResponse.json({ ok: true, id: inserted.id });
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[bookings] list error", error);
    return NextResponse.json(
      { error: "Could not load bookings." },
      { status: 500 }
    );
  }

  return NextResponse.json({ bookings: data });
}
