import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { adminToken, checkAdminPassword, ADMIN_COOKIE } from "@/lib/admin-auth";
import { checkRateLimit, ipFromRequest } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LoginSchema = z.object({ password: z.string().min(1).max(200) });

export async function POST(req: NextRequest) {
  // Rate limit — 5 attempts / 15 min / IP
  const ip = ipFromRequest(req);
  const rl = checkRateLimit(`admin-login:${ip}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  let data;
  try {
    data = LoginSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Admin panel not configured (ADMIN_PASSWORD missing)." },
      { status: 503 }
    );
  }

  if (!checkAdminPassword(data.password)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminToken()!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
