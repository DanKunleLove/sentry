import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminSupabase } from "@/lib/supabase";
import { checkRateLimit, ipFromRequest } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LeadSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email().max(200),
  company: z.string().max(160).optional(),
  projectType: z
    .enum([
      "llm-integration",
      "automation",
      "full-stack",
      "creative-ai",
      "evaluation",
      "other",
    ])
    .optional(),
  budgetBand: z
    .enum(["<5k", "5k-15k", "15k-50k", "50k+", "retainer", "unsure"])
    .optional(),
  timeline: z
    .enum(["urgent", "1-month", "1-3-months", "3m+", "exploring"])
    .optional(),
  intent: z.string().max(1000).optional(),
  conversationId: z.string().uuid().optional(),
  source: z.string().max(40).optional(),
});

export async function POST(req: NextRequest) {
  // Rate limit — 10/hour/IP
  const ip = ipFromRequest(req);
  const rl = checkRateLimit(`lead:${ip}`, { limit: 10, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  // Parse
  let data;
  try {
    const json = await req.json();
    data = LeadSchema.parse(json);
  } catch {
    return NextResponse.json(
      { error: "Invalid lead payload." },
      { status: 400 }
    );
  }

  // If Supabase isn't configured yet, succeed-as-noop but surface a warning log.
  // This lets the site run locally before the user provisions Supabase.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.warn("[lead] Supabase not configured — dropping lead:", data.email);
    return NextResponse.json({
      ok: true,
      warning: "Supabase not configured; lead not persisted.",
    });
  }

  const supabase = getAdminSupabase();
  const { data: inserted, error } = await supabase
    .from("leads")
    .insert({
      name: data.name ?? null,
      email: data.email,
      company: data.company ?? null,
      project_type: data.projectType ?? null,
      budget_band: data.budgetBand ?? null,
      timeline: data.timeline ?? null,
      intent: data.intent ?? null,
      conversation_id: data.conversationId ?? null,
      source: data.source ?? "chat",
      status: "new",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[lead] supabase insert error", error);
    return NextResponse.json({ error: "Could not save lead." }, { status: 500 });
  }

  // Fire-and-forget webhook notification (Slack/Discord/Telegram/Zapier)
  const webhook = process.env.LEAD_NOTIFY_WEBHOOK;
  if (webhook) {
    fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `🔥 New lead: ${data.name ?? "(no name)"} <${data.email}> — ${
          data.projectType ?? "unspecified"
        } / ${data.budgetBand ?? "?"} / ${data.timeline ?? "?"}\n${
          data.intent ?? ""
        }`,
      }),
    }).catch((err) => console.error("[lead] webhook error", err));
  }

  return NextResponse.json({ ok: true, id: inserted.id });
}
