import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { Type as GType } from "@google/genai";
import { getGemini, GEMINI_MODEL } from "@/lib/gemini";
import { personaMarkdown } from "@/content/persona";
import { agentTools, executeToolCall } from "@/lib/agent-tools";
import { checkRateLimit, ipFromRequest } from "@/lib/ratelimit";
import { getAdminSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TOOL_ROUNDS = 5;

const MessageSchema = z.object({
  role: z.enum(["user", "model"]),
  content: z.string().min(1).max(2000),
});

const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(20),
  sessionId: z.string().max(100).optional(),
});

/** Insert helper for Supabase — no-ops if not configured. */
async function supabaseInsert(table: string, data: Record<string, unknown>) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(`[agent] Supabase not configured — skipping ${table} insert.`);
    return;
  }
  const sb = getAdminSupabase();
  const { error } = await sb.from(table).insert(data);
  if (error) throw error;
}

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = ipFromRequest(req);
  const rl = checkRateLimit(`chat:${ip}`, { limit: 20, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again later.", resetAt: rl.resetAt },
      { status: 429 }
    );
  }

  // Parse body
  let parsed;
  try {
    const json = await req.json();
    parsed = BodySchema.parse(json);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Server env check
  if (!process.env.GOOGLE_AI_API_KEY) {
    return NextResponse.json(
      { error: "Chat is not configured yet — GOOGLE_AI_API_KEY missing." },
      { status: 503 }
    );
  }

  const gemini = getGemini();

  // Build conversation history for Gemini
  const contents = parsed.messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  // Event stream encoder
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      function emit(event: { type: string; [k: string]: unknown }) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      }

      try {
        let currentContents = [...contents];
        let round = 0;

        // Agent loop: call Gemini, process tool calls, repeat
        while (round < MAX_TOOL_ROUNDS) {
          round++;

          const response = await gemini.models.generateContent({
            model: GEMINI_MODEL,
            contents: currentContents,
            config: {
              systemInstruction: personaMarkdown,
              temperature: 0.7,
              maxOutputTokens: 1024,
              tools: [{ functionDeclarations: agentTools }],
            },
          });

          const candidate = response.candidates?.[0];
          if (!candidate?.content?.parts) break;

          const parts = candidate.content.parts;
          const functionCalls = parts.filter((p: any) => p.functionCall);
          const textParts = parts.filter((p: any) => p.text);

          // If there are function calls, execute them
          if (functionCalls.length > 0) {
            for (const part of functionCalls) {
              const fc = (part as any).functionCall;
              const toolName = fc.name as string;
              const toolArgs = (fc.args ?? {}) as Record<string, unknown>;

              emit({ type: "tool_start", tool: toolName });

              const result = await executeToolCall(toolName, toolArgs, supabaseInsert);

              emit({ type: "tool_end", tool: toolName, success: result.success });

              // Add the assistant's function call and the result to history
              currentContents.push({
                role: "model",
                parts: [{ functionCall: { name: toolName, args: toolArgs } } as any],
              });
              currentContents.push({
                role: "user",
                parts: [
                  {
                    functionResponse: {
                      name: toolName,
                      response: result.data,
                    },
                  } as any,
                ],
              });
            }

            // If there was also text in this response, emit it
            if (textParts.length > 0) {
              const text = textParts.map((p: any) => p.text).join("");
              emit({ type: "text", content: text });
            }

            // Continue loop — Gemini will generate a follow-up response
            continue;
          }

          // No function calls — stream the final text response
          // For the final response, use streaming for better UX
          const stream = await gemini.models.generateContentStream({
            model: GEMINI_MODEL,
            contents: currentContents,
            config: {
              systemInstruction: personaMarkdown,
              temperature: 0.7,
              maxOutputTokens: 1024,
              // No tools on final streaming pass to avoid re-triggering
            },
          });

          for await (const chunk of stream) {
            const text = chunk.text;
            if (text) emit({ type: "text", content: text });
          }

          break; // Done
        }

        emit({ type: "done" });
        controller.close();
      } catch (err) {
        console.error("[agent] error:", err);
        const msg = err instanceof Error ? err.message : "Agent error";
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: "error", message: msg }) + "\n")
        );
        controller.close();
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
}
