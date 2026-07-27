import { NextResponse, type NextRequest } from "next/server";
import { getAdminSupabase } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  const { data, error } = await supabase.from("bookings").select("status");

  if (error) {
    console.error("[bookings] stats error", error);
    return NextResponse.json(
      { error: "Could not load stats." },
      { status: 500 }
    );
  }

  const stats = { total: data.length, pending: 0, approved: 0, declined: 0 };
  for (const row of data) {
    if (row.status === "pending") stats.pending += 1;
    else if (row.status === "approved") stats.approved += 1;
    else if (row.status === "declined") stats.declined += 1;
  }

  return NextResponse.json(stats);
}
