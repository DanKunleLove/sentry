import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminSupabase } from "@/lib/supabase";
import { checkRateLimit, ipFromRequest } from "@/lib/ratelimit";
import { isAdminRequest } from "@/lib/admin-auth";
import { notifyBookingEmail } from "@/lib/email";
import { appendBookingRow } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BookingSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(200),
  whatsapp: z.string().min(7).max(30),
  role: z.string().min(2).max(160),
  need: z.string().min(10).max(2000),
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

  const supabase = getAdminSupabase();
  const { data: inserted, error } = await supabase
    .from("bookings")
    .insert({
      full_name: data.fullName,
      email: data.email,
      whatsapp: data.whatsapp,
      role: data.role,
      need: data.need,
      status: "pending",
    })
    .select("id, created_at")
    .single();

  if (error) {
    console.error("[bookings] insert error", error);
    return NextResponse.json(
      { error: "Could not save your request. Please try again." },
      { status: 500 }
    );
  }

  // Notify Dan + sync to Google Sheets. Failures are logged, never block the visitor.
  await Promise.allSettled([
    notifyBookingEmail({
      fullName: data.fullName,
      email: data.email,
      whatsapp: data.whatsapp,
      role: data.role,
      need: data.need,
    }),
    appendBookingRow({
      createdAt: inserted.created_at,
      fullName: data.fullName,
      email: data.email,
      whatsapp: data.whatsapp,
      role: data.role,
      need: data.need,
      status: "pending",
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
