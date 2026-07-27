import "server-only";
import nodemailer from "nodemailer";

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const DAN_EMAIL = "adelusidankunle@gmail.com";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn("[email] SMTP_USER or SMTP_PASS missing — email disabled.");
    return null;
  }
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

interface EmailOpts {
  to?: string;
  subject: string;
  html: string;
  fromName?: string;
}

/** Send an email via Gmail SMTP. Gracefully no-ops if SMTP not configured. */
export async function sendEmail(opts: EmailOpts): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;
  try {
    await t.sendMail({
      from: `"${opts.fromName ?? "Sentry Agent"}" <${SMTP_USER}>`,
      to: opts.to ?? DAN_EMAIL,
      subject: opts.subject,
      html: opts.html,
      replyTo: DAN_EMAIL,
    });
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}

/** Escape user-supplied strings before interpolating into email HTML. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Notify Dan about a new lead. */
export async function notifyLeadEmail(lead: {
  name?: string;
  email: string;
  phone?: string;
  company?: string;
  projectType?: string;
  timeline?: string;
  intent?: string;
}): Promise<boolean> {
  return sendEmail({
    subject: `🔥 New Lead: ${lead.name || lead.email}`,
    html: `
      <h2>New lead from Sentry Agent</h2>
      <table style="border-collapse:collapse;font-family:sans-serif;">
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Name</td><td>${lead.name || "—"}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Email</td><td><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Phone</td><td>${lead.phone || "—"}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Company</td><td>${lead.company || "—"}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Project</td><td>${lead.projectType || "—"}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Timeline</td><td>${lead.timeline || "—"}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Intent</td><td>${lead.intent || "—"}</td></tr>
      </table>
      <p style="margin-top:16px;color:#666;font-size:12px;">Sent by Sentry Agent · ${new Date().toISOString()}</p>
    `,
  });
}

export interface BookingEmailData {
  fullName: string;
  email: string;
  whatsapp: string;
  role: string;
  need: string;
  source?: string;
  social?: string;
  slotStart?: string; // ISO UTC
  visitorTz?: string;
  wantsResources?: boolean;
}

/** Format an ISO instant in a given IANA timezone, falling back to WAT. */
function fmtSlot(iso: string, tz?: string): string {
  const d = new Date(iso);
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  };
  try {
    return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: tz || "Africa/Lagos" }).format(d);
  } catch {
    return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "Africa/Lagos" }).format(d);
  }
}

/** "their local time (+ WAT if different)" line for a slot. */
function slotLine(slotStart: string, visitorTz?: string): string {
  const local = fmtSlot(slotStart, visitorTz);
  const wat = fmtSlot(slotStart, "Africa/Lagos");
  return local === wat ? esc(local) : `${esc(local)} <span style="color:#666;">(${esc(wat)} WAT)</span>`;
}

/** Ensure a social handle/link renders as a clickable URL. */
function socialHref(social: string): string {
  return /^https?:\/\//i.test(social) ? social : `https://${social}`;
}

const btn = (href: string, label: string, bg: string) =>
  `<a href="${href}" style="display:inline-block;background:${bg};color:#fff;text-decoration:none;padding:12px 28px;border-radius:999px;font-weight:600;margin-right:12px;">${label}</a>`;

/**
 * Notify Dan about a new /book request — includes the picked slot, the
 * applicant's social link for vetting, and one-click Approve/Decline buttons.
 */
export async function notifyBookingEmail(
  b: BookingEmailData,
  actions?: { approveUrl: string; declineUrl: string }
): Promise<boolean> {
  const waDigits = b.whatsapp.replace(/\D/g, "");
  return sendEmail({
    to: process.env.NOTIFICATION_EMAIL || undefined,
    subject: `📅 Session request: ${b.fullName}${b.slotStart ? ` — ${fmtSlot(b.slotStart, "Africa/Lagos")}` : ""}`,
    html: `
      <h2>New session request from /book</h2>
      ${b.slotStart ? `<p style="font-size:16px;"><strong>Requested slot:</strong> ${fmtSlot(b.slotStart, "Africa/Lagos")} WAT</p>` : ""}
      <table style="border-collapse:collapse;font-family:sans-serif;">
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Name</td><td>${esc(b.fullName)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Email</td><td><a href="mailto:${esc(b.email)}">${esc(b.email)}</a></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">WhatsApp</td><td><a href="https://wa.me/${waDigits}">${esc(b.whatsapp)}</a></td></tr>
        ${b.social ? `<tr><td style="padding:4px 12px 4px 0;color:#666;">Social</td><td><a href="${esc(socialHref(b.social))}">${esc(b.social)}</a></td></tr>` : ""}
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Role</td><td>${esc(b.role)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Source</td><td>${esc(b.source || "direct")}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Resources</td><td>${b.wantsResources ? "wants the pack (auto-sends after session)" : "no"}</td></tr>
      </table>
      <h3>What they want from the session</h3>
      <p style="background:#f5f5f5;padding:12px;border-radius:8px;">${esc(b.need)}</p>
      ${
        actions
          ? `<p style="margin:24px 0;">${btn(actions.approveUrl, "✓ Approve", "#1a7f37")}${btn(actions.declineUrl, "✕ Decline", "#57606a")}</p>
             <p style="color:#666;font-size:12px;">Approving creates the calendar event + Google Meet link and confirms with them automatically. Buttons open a confirmation page — nothing happens on a stray click.</p>`
          : `<p style="margin-top:16px;color:#666;font-size:12px;">Approve or decline in the admin panel.</p>`
      }
      <p style="margin-top:16px;color:#666;font-size:12px;">Sent by Sentry · ${new Date().toISOString()}</p>
    `,
  });
}

/** Instant "request received" email to the applicant — keeps the lead warm. */
export async function bookingReceivedEmail(b: {
  fullName: string;
  email: string;
  slotStart: string;
  visitorTz?: string;
}): Promise<boolean> {
  const firstName = b.fullName.split(" ")[0];
  return sendEmail({
    to: b.email,
    fromName: "Dan Adelusi",
    subject: "Got your session request — confirming shortly",
    html: `
      <div style="font-family:sans-serif;max-width:560px;">
        <p>Hi ${esc(firstName)},</p>
        <p>Your free AI setup session request is in for:</p>
        <p style="background:#f5f5f5;padding:12px;border-radius:8px;font-size:16px;"><strong>${slotLine(b.slotStart, b.visitorTz)}</strong></p>
        <p>I personally review every request. You'll get a confirmation email with your Google Meet link shortly — usually within a few hours.</p>
        <p>Talk soon,<br/>Dan Adelusi<br/>AI Engineer · Co-founder, Mabi Labs</p>
      </div>
    `,
  });
}

/** Session confirmed — includes the real slot time and Google Meet link. */
export async function bookingApprovedEmail(b: {
  fullName: string;
  email: string;
  slotStart?: string | null;
  visitorTz?: string | null;
  meetLink?: string | null;
}): Promise<boolean> {
  const firstName = b.fullName.split(" ")[0];
  return sendEmail({
    to: b.email,
    fromName: "Dan Adelusi",
    subject: "Your free AI setup session is confirmed ✓",
    html: `
      <div style="font-family:sans-serif;max-width:560px;">
        <p>Hi ${esc(firstName)},</p>
        <p>Confirmed — your free AI setup session is locked in${b.slotStart ? " for:" : "."}</p>
        ${b.slotStart ? `<p style="background:#f5f5f5;padding:12px;border-radius:8px;font-size:16px;"><strong>${slotLine(b.slotStart, b.visitorTz ?? undefined)}</strong></p>` : ""}
        ${
          b.meetLink
            ? `<p style="margin:24px 0;"><a href="${esc(b.meetLink)}" style="display:inline-block;background:#1a7f37;color:#fff;text-decoration:none;padding:12px 28px;border-radius:999px;font-weight:600;">Join on Google Meet</a></p>
               <p style="color:#666;font-size:13px;">You'll also find this link in the calendar invite that just landed in your inbox.</p>`
            : `<p>A calendar invite with the video call link is on its way to this email address.</p>`
        }
        <p>Come with your workflow or problem in mind — the more specific, the more we get done in 30 minutes.</p>
        <p>Talk soon,<br/>Dan Adelusi<br/>AI Engineer · Co-founder, Mabi Labs</p>
      </div>
    `,
  });
}

/** Politely decline — with a link to pick another time. */
export async function bookingDeclinedEmail(b: {
  fullName: string;
  email: string;
  rebookUrl?: string;
}): Promise<boolean> {
  const firstName = b.fullName.split(" ")[0];
  return sendEmail({
    to: b.email,
    fromName: "Dan Adelusi",
    subject: "About your AI setup session request",
    html: `
      <div style="font-family:sans-serif;max-width:560px;">
        <p>Hi ${esc(firstName)},</p>
        <p>Thanks for requesting a free AI setup session. I couldn't take this one — the slot didn't work out on my end.</p>
        ${b.rebookUrl ? `<p style="margin:24px 0;"><a href="${esc(b.rebookUrl)}" style="display:inline-block;background:#0969da;color:#fff;text-decoration:none;padding:12px 28px;border-radius:999px;font-weight:600;">Pick another time</a></p>` : ""}
        <p>In the meantime, my content on Instagram and TikTok (@dankunleai) covers a lot of what we'd discuss.</p>
        <p>Thanks for your patience,<br/>Dan Adelusi<br/>AI Engineer · Co-founder, Mabi Labs</p>
      </div>
    `,
  });
}

/** Post-session resource pack delivery. Sent only AFTER an approved session ends. */
export async function resourcesEmail(b: {
  fullName: string;
  email: string;
  packTitle: string;
  packUrl: string;
  packBlurb: string;
}): Promise<boolean> {
  const firstName = b.fullName.split(" ")[0];
  return sendEmail({
    to: b.email,
    fromName: "Dan Adelusi",
    subject: `Your ${b.packTitle} — as promised`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;">
        <p>Hi ${esc(firstName)},</p>
        <p>Great session — here's the resource pack I promised:</p>
        <p>${esc(b.packBlurb)}</p>
        <p style="margin:24px 0;"><a href="${esc(b.packUrl)}" style="display:inline-block;background:#0969da;color:#fff;text-decoration:none;padding:12px 28px;border-radius:999px;font-weight:600;">Open the ${esc(b.packTitle)}</a></p>
        <p>If it helps you, a quick review or a share means a lot — and if you know someone who needs the same setup, send them my way.</p>
        <p>Dan Adelusi<br/>AI Engineer · Co-founder, Mabi Labs</p>
      </div>
    `,
  });
}

/** Notify Dan about a visitor message. */
export async function notifyMessageEmail(visitor: {
  name?: string;
  email?: string;
  phone?: string;
  message: string;
}): Promise<boolean> {
  return sendEmail({
    subject: `💬 Message from ${visitor.name || visitor.email || "a visitor"}`,
    html: `
      <h2>Visitor wants to reach you</h2>
      <p><strong>Name:</strong> ${visitor.name || "—"}</p>
      <p><strong>Email:</strong> ${visitor.email ? `<a href="mailto:${visitor.email}">${visitor.email}</a>` : "—"}</p>
      <p><strong>Phone:</strong> ${visitor.phone || "—"}</p>
      <h3>Message</h3>
      <p style="background:#f5f5f5;padding:12px;border-radius:8px;">${visitor.message}</p>
      <p style="margin-top:16px;color:#666;font-size:12px;">Sent by Sentry Agent · ${new Date().toISOString()}</p>
    `,
  });
}
