import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "sentry_admin";

/** Derived session token — a hash of the admin password, never the password itself. */
export function adminToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHash("sha256").update(`sentry-admin-v1:${pw}`).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** True when the request carries a valid admin session cookie. */
export function isAdminRequest(req: NextRequest): boolean {
  const token = adminToken();
  if (!token) return false;
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!cookie) return false;
  return safeEqual(cookie, token);
}

/** Timing-safe password check for the login route. */
export function checkAdminPassword(password: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  return safeEqual(password, pw);
}
