import "server-only";
import { Type, type FunctionDeclaration } from "@google/genai";
import { works } from "@/content/works";
import { services, engagementTypes } from "@/content/services";
import { notifyLeadEmail, notifyMessageEmail } from "./email";
import { isCalendarConfigured, getFreeBusy, createMeeting } from "./calendar";

// ── Tool declarations (sent to Gemini) ──

export const agentTools: FunctionDeclaration[] = [
  {
    name: "capture_lead",
    description:
      "Save a visitor's contact information as a lead. Call this WHENEVER a visitor shares an email address, phone number, or asks to be contacted. Even partial info is valuable — save what you have.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Visitor's name" },
        email: { type: Type.STRING, description: "Visitor's email address" },
        phone: { type: Type.STRING, description: "Visitor's phone or WhatsApp number" },
        company: { type: Type.STRING, description: "Visitor's company name" },
        projectType: {
          type: Type.STRING,
          description: "Type of project: llm-integration, automation, full-stack, creative-ai, evaluation, marketing, web-ecommerce, or other",
        },
        timeline: {
          type: Type.STRING,
          description: "Timeline: urgent, 1-month, 1-3-months, 3m+, or exploring",
        },
        intent: { type: Type.STRING, description: "One-sentence summary of what the visitor needs" },
      },
      required: ["email"],
    },
  },
  {
    name: "notify_dan",
    description:
      "Send a direct notification to Dan when a visitor explicitly asks to reach him, leave a message, or wants Dan to contact them.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        visitorName: { type: Type.STRING, description: "Visitor's name" },
        visitorEmail: { type: Type.STRING, description: "Visitor's email" },
        visitorPhone: { type: Type.STRING, description: "Visitor's phone or WhatsApp" },
        message: { type: Type.STRING, description: "The message or request for Dan" },
      },
      required: ["message"],
    },
  },
  {
    name: "lookup_project",
    description:
      "Look up details about a specific project Dan has built. Use when visitors ask about a project by name or want to see examples of relevant work.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: "Project name or topic to search for (e.g., 'Phantm', 'voice agent', 'automation')",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "list_services",
    description:
      "Return the list of services Dan offers. Use when visitors ask what Dan can do, what services are available, or about specific capabilities.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        category: {
          type: Type.STRING,
          description: "Optional filter: ai-engineering, automation, full-stack, creative-ai, ai-training",
        },
      },
    },
  },
  {
    name: "check_availability",
    description:
      "Return information about Dan's availability and engagement types. Use when visitors ask about rates, availability, how to work together, or engagement models.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        engagementType: {
          type: Type.STRING,
          description: "Optional: freelance, contract, remote-ft, advisory, training",
        },
      },
    },
  },
  {
    name: "check_calendar",
    description:
      "Check Dan's real calendar for free/busy slots over the next few days. Use when visitors ask to schedule a call, check Dan's availability for a meeting, or want to know when Dan is free.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        days: {
          type: Type.NUMBER,
          description: "Number of days ahead to check (default 7, max 14)",
        },
      },
    },
  },
  {
    name: "book_meeting",
    description:
      "Book a meeting on Dan's calendar and send a Google Meet invite to the visitor. Only call this after the visitor has confirmed a time and provided their email.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        attendeeEmail: {
          type: Type.STRING,
          description: "Visitor's email address for the calendar invite",
        },
        startTime: {
          type: Type.STRING,
          description: "Meeting start time in ISO 8601 format (e.g., 2026-04-20T14:00:00+01:00)",
        },
        durationMinutes: {
          type: Type.NUMBER,
          description: "Meeting duration in minutes (default 30)",
        },
        summary: {
          type: Type.STRING,
          description: "Meeting title (e.g., 'Call with Toke — AI automation for e-commerce')",
        },
        description: {
          type: Type.STRING,
          description: "Optional meeting description with context",
        },
      },
      required: ["attendeeEmail", "startTime", "summary"],
    },
  },
];

// ── Tool handlers ──

export type ToolResult = { success: boolean; data: unknown };

export async function executeToolCall(
  name: string,
  args: Record<string, unknown>,
  supabaseInsert?: (table: string, data: Record<string, unknown>) => Promise<void>,
  conversationId?: string | null
): Promise<ToolResult> {
  switch (name) {
    case "capture_lead":
      return handleCaptureLead(args, supabaseInsert, conversationId);
    case "notify_dan":
      return handleNotifyDan(args);
    case "lookup_project":
      return handleLookupProject(args);
    case "list_services":
      return handleListServices(args);
    case "check_availability":
      return handleCheckAvailability(args);
    case "check_calendar":
      return handleCheckCalendar(args);
    case "book_meeting":
      return handleBookMeeting(args);
    default:
      return { success: false, data: { error: `Unknown tool: ${name}` } };
  }
}

async function handleCaptureLead(
  args: Record<string, unknown>,
  supabaseInsert?: (table: string, data: Record<string, unknown>) => Promise<void>,
  conversationId?: string | null
): Promise<ToolResult> {
  const email = args.email as string;
  if (!email) return { success: false, data: { error: "Email is required" } };

  const leadData: Record<string, unknown> = {
    name: (args.name as string) || null,
    email,
    phone: (args.phone as string) || null,
    company: (args.company as string) || null,
    project_type: (args.projectType as string) || null,
    timeline: (args.timeline as string) || null,
    intent: (args.intent as string) || null,
    source: "agent",
    status: "new",
  };
  if (conversationId) leadData.conversation_id = conversationId;

  // Save to Supabase
  if (supabaseInsert) {
    try {
      await supabaseInsert("leads", leadData);
      console.log("[agent] ✓ lead saved to Supabase:", email);
    } catch (err) {
      console.error("[agent] ✗ lead insert FAILED for", email, "— error:", err);
    }
  } else {
    console.warn("[agent] supabaseInsert callback not provided — lead not saved to DB");
  }

  // Email notification to Dan
  await notifyLeadEmail({
    name: (leadData.name as string) ?? undefined,
    email: leadData.email as string,
    phone: (leadData.phone as string) ?? undefined,
    company: (leadData.company as string) ?? undefined,
    projectType: (leadData.project_type as string) ?? undefined,
    timeline: (leadData.timeline as string) ?? undefined,
    intent: (leadData.intent as string) ?? undefined,
  });

  return {
    success: true,
    data: {
      message: `Lead saved: ${email}. Dan has been notified via email.`,
    },
  };
}

async function handleNotifyDan(args: Record<string, unknown>): Promise<ToolResult> {
  const message = args.message as string;
  if (!message) return { success: false, data: { error: "Message is required" } };

  await notifyMessageEmail({
    name: (args.visitorName as string) || undefined,
    email: (args.visitorEmail as string) || undefined,
    phone: (args.visitorPhone as string) || undefined,
    message,
  });

  return {
    success: true,
    data: { message: "Dan has been notified. He'll get back to you soon." },
  };
}

function handleLookupProject(args: Record<string, unknown>): Promise<ToolResult> {
  const query = ((args.query as string) || "").toLowerCase();
  if (!query) return Promise.resolve({ success: false, data: { error: "Query is required" } });

  // Search by slug, title, tags, categories
  const matches = works.filter(
    (w) =>
      w.slug.includes(query) ||
      w.title.toLowerCase().includes(query) ||
      w.tagline.toLowerCase().includes(query) ||
      w.categories.some((c) => c.includes(query)) ||
      w.tags?.some((t) => t.toLowerCase().includes(query)) ||
      w.stack.some((s) => s.toLowerCase().includes(query))
  );

  if (matches.length === 0) {
    return Promise.resolve({
      success: true,
      data: {
        message: "No projects matched that query.",
        availableProjects: works.map((w) => w.title).join(", "),
      },
    });
  }

  const results = matches.map((w) => ({
    title: w.title,
    slug: w.slug,
    tagline: w.tagline,
    year: w.year,
    client: w.client,
    role: w.role,
    status: w.status,
    stack: w.stack,
    metrics: w.metrics,
    summary: w.summary,
    link: `/work/${w.slug}`,
  }));

  return Promise.resolve({ success: true, data: { projects: results } });
}

function handleListServices(args: Record<string, unknown>): Promise<ToolResult> {
  const category = (args.category as string) || "";
  const filtered = category
    ? services.filter((s) => s.id.includes(category))
    : services;

  const result = filtered.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.lede,
    deliverables: s.deliverables,
    stack: s.stack,
  }));

  return Promise.resolve({ success: true, data: { services: result } });
}

function handleCheckAvailability(args: Record<string, unknown>): Promise<ToolResult> {
  const typeFilter = (args.engagementType as string) || "";
  const filtered = typeFilter
    ? engagementTypes.filter((e) => e.id.includes(typeFilter))
    : engagementTypes;

  const result = {
    status: "Available for new work",
    location: "Remote worldwide · WAT (UTC+1)",
    timezone: "WAT (UTC+1)",
    engagementTypes: filtered.map((e) => ({
      type: e.label,
      description: e.blurb,
    })),
    contact: "adelusidankunle@gmail.com",
    note: "Ask the visitor which engagement type fits their org, then capture their contact info.",
  };

  return Promise.resolve({ success: true, data: result });
}

async function handleCheckCalendar(args: Record<string, unknown>): Promise<ToolResult> {
  if (!isCalendarConfigured()) {
    return {
      success: true,
      data: {
        message: "Calendar integration is not set up yet. Tell the visitor: 'My calendar integration is coming soon — for now, share your email and preferred time, and I'll get back to you directly.'",
      },
    };
  }

  const days = Math.min((args.days as number) || 7, 14);
  try {
    const { busy, timeZone } = await getFreeBusy(days);

    if (busy.length === 0) {
      return {
        success: true,
        data: {
          message: `Dan's calendar is open for the next ${days} days.`,
          timeZone,
          busySlots: [],
          suggestion: "Suggest a few time slots and ask the visitor which works best.",
        },
      };
    }

    const busyFormatted = busy.map((b) => ({
      start: new Date(b.start).toLocaleString("en-GB", { timeZone: "Africa/Lagos" }),
      end: new Date(b.end).toLocaleString("en-GB", { timeZone: "Africa/Lagos" }),
    }));

    return {
      success: true,
      data: {
        message: `Found ${busy.length} busy slots in the next ${days} days. Suggest times that avoid these.`,
        timeZone,
        busySlots: busyFormatted,
        suggestion: "Present 2-3 available time slots to the visitor and ask which works best.",
      },
    };
  } catch (err) {
    console.error("[agent] calendar check failed:", err);
    return {
      success: false,
      data: { error: "Could not check calendar. Ask the visitor to share their preferred time and email instead." },
    };
  }
}

async function handleBookMeeting(args: Record<string, unknown>): Promise<ToolResult> {
  if (!isCalendarConfigured()) {
    return {
      success: false,
      data: { error: "Calendar integration is not set up yet. Capture the visitor's email and preferred time, and let them know Dan will confirm manually." },
    };
  }

  const attendeeEmail = args.attendeeEmail as string;
  const startTime = args.startTime as string;
  const summary = args.summary as string;

  if (!attendeeEmail || !startTime || !summary) {
    return { success: false, data: { error: "Need attendeeEmail, startTime, and summary to book a meeting." } };
  }

  try {
    const result = await createMeeting({
      attendeeEmail,
      startTime,
      summary,
      description: (args.description as string) || undefined,
      durationMinutes: (args.durationMinutes as number) || 30,
    });

    return {
      success: true,
      data: {
        message: `Meeting booked! A Google Meet invite has been sent to ${attendeeEmail}. Dan will see it on his calendar.`,
        eventLink: result.htmlLink,
      },
    };
  } catch (err) {
    console.error("[agent] meeting booking failed:", err);
    return {
      success: false,
      data: { error: "Could not book the meeting. Capture the visitor's email and preferred time, and let them know Dan will confirm manually." },
    };
  }
}
