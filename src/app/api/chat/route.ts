import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getGemini, GEMINI_MODEL } from "@/lib/gemini";
import { personaMarkdown } from "@/content/persona";
import { checkRateLimit, ipFromRequest } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MessageSchema = z.object({
  role: z.enum(["user", "model"]),
  content: z.string().min(1).max(2000),
});

const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(20),
});

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = ipFromRequest(req);
  const rl = checkRateLimit(`chat:${ip}`, { limit: 20, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: "Too many requests. Try again later.",
        resetAt: rl.resetAt,
      },
      { status: 429 }
    );
  }

  // Parse body
  let parsed;
  try {
    const json = await req.json();
    parsed = BodySchema.parse(json);
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  // Server env check
  if (!process.env.GOOGLE_AI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Chat is not configured yet — GOOGLE_AI_API_KEY missing on the server.",
      },
      { status: 503 }
    );
  }

  // Build Gemini request
  const gemini = getGemini();
  const history = parsed.messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  try {
    const stream = await gemini.models.generateContentStream({
      model: GEMINI_MODEL,
      contents: history,
      config: {
        systemInstruction: personaMarkdown,
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    // Stream plain text chunks as SSE-lite — client reads as text
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text;
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (streamErr) {
          console.error("gemini stream error", streamErr);
          controller.error(streamErr);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("gemini error", err);
    return NextResponse.json(
      {
        error:
          "The AI twin is temporarily unreachable. Please try again in a moment.",
      },
      { status: 502 }
    );
  }
}
