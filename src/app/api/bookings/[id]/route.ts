import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminSupabase } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  approveBooking,
  declineBooking,
  sendBookingResources,
} from "@/lib/booking-actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PatchSchema = z
  .object({
    status: z.enum(["approved", "declined"]).optional(),
    adminNotes: z.string().max(4000).optional(),
    sendResources: z.literal(true).optional(),
  })
  .refine(
    (d) =>
      d.status !== undefined ||
      d.adminNotes !== undefined ||
      d.sendResources !== undefined,
    { message: "Nothing to update." }
  );

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Invalid booking id." }, { status: 400 });
  }

  let data;
  try {
    data = PatchSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  // Status transitions and resources go through the shared action layer so
  // admin-panel clicks and one-click email links behave identically.
  if (data.status === "approved" || data.sendResources) {
    const result = data.status
      ? await approveBooking(id)
      : await sendBookingResources(id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    // Fall through for adminNotes if present, else return.
    if (data.adminNotes === undefined) {
      return NextResponse.json({ ok: true, booking: await fullRow(id) });
    }
  } else if (data.status === "declined") {
    const result = await declineBooking(id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    if (data.adminNotes === undefined) {
      return NextResponse.json({ ok: true, booking: await fullRow(id) });
    }
  }

  if (data.adminNotes !== undefined) {
    const { error } = await getAdminSupabase()
      .from("bookings")
      .update({
        admin_notes: data.adminNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) {
      console.error("[bookings] notes update error", error);
      return NextResponse.json(
        { error: "Could not update booking." },
        { status: 500 }
      );
    }
  }

  const booking = await fullRow(id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, booking });
}

async function fullRow(id: string) {
  const { data } = await getAdminSupabase()
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();
  return data ?? null;
}
