import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Stateless signed tokens for one-click booking actions from Dan's email.
 * Token = base64url(`${bookingId}.${action}.${expiresAtMs}`) + "." + HMAC.
 * Secret: BOOKING_ACTION_SECRET, falling back to ADMIN_PASSWORD.
 */

export type BookingAction = "approve" | "decline";

const TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

function secret(): string | null {
  return process.env.BOOKING_ACTION_SECRET || process.env.ADMIN_PASSWORD || null;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", `sentry-booking-v1:${key}`)
    .update(payload)
    .digest("base64url");
}

export function createActionToken(
  bookingId: string,
  action: BookingAction
): string | null {
  const key = secret();
  if (!key) return null;
  const payload = Buffer.from(
    `${bookingId}.${action}.${Date.now() + TOKEN_TTL_MS}`
  ).toString("base64url");
  return `${payload}.${sign(payload, key)}`;
}

export function verifyActionToken(
  token: string
): { bookingId: string; action: BookingAction } | null {
  const key = secret();
  if (!key) return null;

  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = sign(payload, key);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const [bookingId, action, expiresAt] = Buffer.from(payload, "base64url")
    .toString()
    .split(".");
  if (!bookingId || (action !== "approve" && action !== "decline")) return null;
  if (!expiresAt || Date.now() > Number(expiresAt)) return null;

  return { bookingId, action };
}
