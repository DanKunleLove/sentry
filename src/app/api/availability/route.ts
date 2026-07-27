import { NextResponse } from "next/server";
import { getOpenSlots } from "@/lib/availability";
import { session } from "@/content/sessions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const slots = await getOpenSlots();
    return NextResponse.json(
      {
        slots,
        durationMinutes: session.durationMinutes,
        sessionName: session.name,
      },
      { headers: { "Cache-Control": "private, max-age=30" } }
    );
  } catch (err) {
    console.error("[availability] failed:", err);
    return NextResponse.json(
      { error: "Could not load available times. Please try again." },
      { status: 500 }
    );
  }
}
