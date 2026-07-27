import { NextResponse, type NextRequest } from "next/server";
import { getAdminSupabase } from "@/lib/supabase";
import { sendBookingResources } from "@/lib/booking-actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Post-session resource delivery. Vercel cron hits this daily (20:00 WAT):
 * every approved booking whose session has ended, wants resources, and
 * hasn't received them yet gets its pack emailed. Idempotent — reruns skip
 * anything already stamped with resources_sent_at.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data, error } = await getAdminSupabase()
    .from("bookings")
    .select("id")
    .eq("status", "approved")
    .eq("wants_resources", true)
    .is("resources_sent_at", null)
    .lt("slot_end", new Date().toISOString());

  if (error) {
    console.error("[cron/resources] query failed:", error);
    return NextResponse.json({ error: "Query failed." }, { status: 500 });
  }

  let sent = 0;
  const failed: string[] = [];
  for (const row of data ?? []) {
    const result = await sendBookingResources(row.id);
    if (result.ok && !result.alreadyDone) sent++;
    else if (!result.ok) failed.push(row.id);
  }

  if (failed.length) console.error("[cron/resources] failed ids:", failed);
  return NextResponse.json({ ok: true, sent, failed: failed.length });
}
