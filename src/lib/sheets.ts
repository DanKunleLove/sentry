import "server-only";
import { createSign } from "node:crypto";

/**
 * Google Sheets lead sync — appends each /book submission as a row.
 * Uses a service account (share the sheet with its client_email as Editor).
 * Zero dependencies: signs the OAuth JWT with node:crypto directly.
 * Gracefully no-ops when GOOGLE_SHEETS_CREDENTIALS / GOOGLE_SHEET_ID are missing.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";

let cachedToken: { token: string; expiresAt: number } | null = null;

function getCredentials(): { clientEmail: string; privateKey: string } | null {
  const raw = process.env.GOOGLE_SHEETS_CREDENTIALS;
  if (!raw) return null;
  try {
    const json = JSON.parse(raw);
    if (!json.client_email || !json.private_key) return null;
    return {
      clientEmail: json.client_email,
      // Env vars often store the key with literal \n sequences
      privateKey: String(json.private_key).replace(/\\n/g, "\n"),
    };
  } catch {
    console.error("[sheets] GOOGLE_SHEETS_CREDENTIALS is not valid JSON.");
    return null;
  }
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function getAccessToken(): Promise<string | null> {
  const creds = getCredentials();
  if (!creds) return null;

  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt > now + 60) {
    return cachedToken.token;
  }

  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: creds.clientEmail,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = b64url(signer.sign(creds.privateKey));
  const assertion = `${header}.${claims}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    console.error("[sheets] token exchange failed:", res.status, await res.text());
    return null;
  }
  const json = await res.json();
  cachedToken = { token: json.access_token, expiresAt: now + (json.expires_in ?? 3600) };
  return cachedToken.token;
}

export interface BookingRow {
  createdAt: string;
  fullName: string;
  email: string;
  whatsapp: string;
  role: string;
  need: string;
  status: string;
}

/** Append one booking as a row. Returns false (with a log) on any failure. */
export async function appendBookingRow(row: BookingRow): Promise<boolean> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId || !process.env.GOOGLE_SHEETS_CREDENTIALS) {
    console.warn("[sheets] not configured — skipping sync.");
    return false;
  }

  try {
    const token = await getAccessToken();
    if (!token) return false;

    const tab = process.env.GOOGLE_SHEET_TAB || "Sheet1";
    const range = encodeURIComponent(`${tab}!A1`);
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [
            [
              row.createdAt,
              row.fullName,
              row.email,
              row.whatsapp,
              row.role,
              row.need,
              row.status,
            ],
          ],
        }),
      }
    );
    if (!res.ok) {
      console.error("[sheets] append failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[sheets] append error:", err);
    return false;
  }
}
