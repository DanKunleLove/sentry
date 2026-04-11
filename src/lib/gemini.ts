import "server-only";
import { GoogleGenAI } from "@google/genai";

/**
 * Server-only Gemini client. Reads the key from env — never ship this to the browser.
 * Throws at call time (not at import) so missing env during build doesn't fail.
 */
let client: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (client) return client;
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_AI_API_KEY missing — set it in .env.local (never commit it)."
    );
  }
  client = new GoogleGenAI({ apiKey });
  return client;
}

export const GEMINI_MODEL = "gemini-2.5-flash";
