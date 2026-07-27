import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminSupabase } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/admin-auth";
import { bookingApprovedEmail, bookingDeclinedEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PatchSchema = z
  .object({
    status: z.enum(["pending", "approved", "declined"]).optional(),
    adminNotes: z.string().max(4000).optional(),
  })
  .refine((d) => d.status !== undefined || d.adminNotes !== undefined, {
    message: "Nothing to update.",
  });

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

  const supabase = getAdminSupabase();

  const { data: existing, error: fetchError } = await supabase
    .from("bookings")
    .select("id, full_name, email, status")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.status !== undefined) update.status = data.status;
  if (data.adminNotes !== undefined) update.admin_notes = data.adminNotes;

  const { data: updated, error } = await supabase
    .from("bookings")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("[bookings] update error", error);
    return NextResponse.json(
      { error: "Could not update booking." },
      { status: 500 }
    );
  }

  // Email the applicant only on an actual status transition.
  if (data.status && data.status !== existing.status) {
    const applicant = { fullName: existing.full_name, email: existing.email };
    if (data.status === "approved") {
      await bookingApprovedEmail(applicant);
    } else if (data.status === "declined") {
      await bookingDeclinedEmail(applicant);
    }
  }

  return NextResponse.json({ ok: true, booking: updated });
}
