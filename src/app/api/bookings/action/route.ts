import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { verifyActionToken } from "@/lib/booking-tokens";
import { approveBooking, declineBooking } from "@/lib/booking-actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({ token: z.string().min(20).max(600) });

/**
 * Executes a one-click action from Dan's notification email.
 * POST-only on purpose: email scanners prefetch GET links, so the emailed
 * URL opens a confirmation page and only a human click reaches this route.
 */
export async function POST(req: NextRequest) {
  let token: string;
  try {
    token = BodySchema.parse(await req.json()).token;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const verified = verifyActionToken(token);
  if (!verified) {
    return NextResponse.json(
      { error: "This link is invalid or has expired." },
      { status: 401 }
    );
  }

  const result =
    verified.action === "approve"
      ? await approveBooking(verified.bookingId)
      : await declineBooking(verified.bookingId);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    action: verified.action,
    alreadyDone: result.alreadyDone ?? false,
    booking: {
      fullName: result.booking.full_name,
      slotStart: result.booking.slot_start,
      meetLink: result.booking.meet_link,
      status: result.booking.status,
    },
  });
}
