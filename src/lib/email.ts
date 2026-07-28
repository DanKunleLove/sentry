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
  return local === wat ? esc(local) : `${esc(local)} <span style="color:${B.muted};">(${esc(wat)} WAT)</span>`;
}

/** Ensure a social handle/link renders as a clickable URL. */
function socialHref(social: string): string {
  return /^https?:\/\//i.test(social) ? social : `https://${social}`;
}

/* ── Branded email design system ─────────────────────────────────────────
   Editorial take on the site's ink/bone/molten-orange palette, adapted for
   email clients: table-free flow layout, inline styles only, light body for
   deliverability, serif display headings, pill buttons. */

const B = {
  ink: "#0A0A0C",
  bone: "#F5F1E8",
  canvas: "#EFEBE2",
  card: "#F7F4EE",
  border: "#E7E2D8",
  text: "#1F1D1A",
  muted: "#6B675F",
  accent: "#FF5B1F",
} as const;

const F_SANS =
  "-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const F_SERIF = "Georgia,'Times New Roman',serif";

/** Outer frame: dark wordmark header, white body card, muted footer. */
function shell(opts: { preheader: string; body: string }): string {
  return `
  <div style="background:${B.canvas};padding:32px 16px;font-family:${F_SANS};">
    <span style="display:none;max-height:0;overflow:hidden;">${esc(opts.preheader)}</span>
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid ${B.border};">
      <div style="background:${B.ink};padding:20px 36px;">
        <span style="font-family:${F_SERIF};font-size:19px;color:${B.bone};">Dan&nbsp;Adelusi</span>
        <span style="color:${B.accent};font-size:19px;">.</span>
        <span style="float:right;font-size:10px;letter-spacing:3px;color:#8a877f;text-transform:uppercase;padding-top:7px;">AI&nbsp;Engineer</span>
      </div>
      <div style="padding:36px;color:${B.text};font-size:15px;line-height:1.65;">
        ${opts.body}
      </div>
      <div style="padding:22px 36px;border-top:1px solid ${B.border};font-size:12px;color:${B.muted};line-height:1.7;">
        Dan Adelusi — AI Engineer · Co-founder, Mabi Labs<br/>
        <a href="https://adelusidankunle.vercel.app" style="color:${B.accent};text-decoration:none;">adelusidankunle.vercel.app</a>
        &nbsp;·&nbsp;<a href="https://www.instagram.com/dankunleai" style="color:${B.muted};text-decoration:none;">Instagram</a>
        &nbsp;·&nbsp;<a href="https://www.tiktok.com/@dkl612" style="color:${B.muted};text-decoration:none;">TikTok</a>
      </div>
    </div>
  </div>`;
}

/** Serif display heading. */
const h1 = (text: string) =>
  `<h1 style="font-family:${F_SERIF};font-weight:normal;font-size:26px;line-height:1.25;color:${B.ink};margin:0 0 18px;">${text}</h1>`;

/** Highlighted card for the session time. */
const slotCard = (inner: string) =>
  `<div style="background:${B.card};border-left:3px solid ${B.accent};border-radius:14px;padding:18px 22px;margin:22px 0;font-family:${F_SERIF};font-size:17px;color:${B.ink};">${inner}</div>`;

/** Primary pill button. */
const btn = (href: string, label: string, bg: string = B.accent) =>
  `<a href="${href}" style="display:inline-block;background:${bg};color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:999px;font-weight:600;font-size:15px;margin:4px 12px 4px 0;">${label}</a>`;

/** Secondary bordered pill button. */
const btnGhost = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#ffffff;color:${B.text};text-decoration:none;padding:13px 31px;border-radius:999px;font-weight:600;font-size:15px;border:1px solid ${B.border};margin:4px 12px 4px 0;">${label}</a>`;

/** Label/value detail rows. */
function infoRows(rows: [string, string][]): string {
  return `<table style="border-collapse:collapse;width:100%;margin:18px 0;">${rows
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:7px 16px 7px 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${B.muted};white-space:nowrap;vertical-align:top;">${label}</td>
          <td style="padding:7px 0;font-size:14px;color:${B.text};">${value}</td>
        </tr>`
    )
    .join("")}</table>`;
}

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
    html: shell({
      preheader: `${b.fullName} wants a session${b.slotStart ? ` — ${fmtSlot(b.slotStart, "Africa/Lagos")} WAT` : ""}`,
      body: `
        ${h1("New session request")}
        ${b.slotStart ? slotCard(`${fmtSlot(b.slotStart, "Africa/Lagos")} <span style="color:${B.muted};font-family:${F_SANS};font-size:13px;">WAT</span>`) : ""}
        ${infoRows([
          ["Name", esc(b.fullName)],
          ["Email", `<a href="mailto:${esc(b.email)}" style="color:${B.accent};text-decoration:none;">${esc(b.email)}</a>`],
          ["WhatsApp", `<a href="https://wa.me/${waDigits}" style="color:${B.accent};text-decoration:none;">${esc(b.whatsapp)}</a>`],
          ...(b.social ? [["Social", `<a href="${esc(socialHref(b.social))}" style="color:${B.accent};text-decoration:none;">${esc(b.social)}</a>`] as [string, string]] : []),
          ["Role", esc(b.role)],
          ["Source", esc(b.source || "direct")],
          ["Resources", b.wantsResources ? "wants the pack (auto-sends after session)" : "no"],
        ])}
        <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${B.muted};margin:20px 0 8px;">What they want</p>
        <div style="background:${B.card};border-radius:14px;padding:16px 20px;">${esc(b.need)}</div>
        ${
          actions
            ? `<div style="margin:26px 0 6px;">${btn(actions.approveUrl, "Approve session")}${btnGhost(actions.declineUrl, "Decline")}</div>
               <p style="color:${B.muted};font-size:12px;">Approving creates the calendar event + Google Meet link and confirms with them automatically. Buttons open a confirmation page — nothing happens on a stray click.</p>`
            : `<p style="color:${B.muted};font-size:12px;margin-top:20px;">Approve or decline in the admin panel.</p>`
        }
      `,
    }),
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
    html: shell({
      preheader: "Your free AI setup session request is in — confirmation coming shortly.",
      body: `
        ${h1(`Your request is in, ${esc(firstName)}.`)}
        <p style="margin:0 0 4px;">Your free AI setup session is penciled in for:</p>
        ${slotCard(slotLine(b.slotStart, b.visitorTz))}
        ${infoRows([
          ["Next", "I personally review every request — expect your confirmation within a few hours."],
          ["Then", "Your confirmation email arrives with the Google Meet link and a calendar invite."],
          ["Prepare", "Come with your workflow or problem in mind. Specific beats general."],
        ])}
        <p style="margin:22px 0 0;">Talk soon,<br/><span style="font-family:${F_SERIF};font-size:16px;">Dan Adelusi</span><br/><span style="color:${B.muted};font-size:13px;">AI Engineer · Co-founder, Mabi Labs</span></p>
      `,
    }),
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
    html: shell({
      preheader: "Locked in — your Google Meet link and calendar invite are ready.",
      body: `
        ${h1(`You're locked in, ${esc(firstName)}.`)}
        <p style="margin:0 0 4px;">Your free AI setup session is confirmed${b.slotStart ? " for:" : "."}</p>
        ${b.slotStart ? slotCard(slotLine(b.slotStart, b.visitorTz ?? undefined)) : ""}
        ${
          b.meetLink
            ? `<div style="margin:26px 0 10px;">${btn(esc(b.meetLink), "Join on Google Meet")}</div>
               <p style="color:${B.muted};font-size:13px;margin:0 0 18px;">The same link is in the calendar invite that just landed in your inbox — you'll get a reminder 30 minutes before we start.</p>`
            : `<p>A calendar invite with the video call link is on its way to this email address.</p>`
        }
        <p>Come with your workflow or problem in mind — the more specific, the more we get done in 30 minutes.</p>
        <p style="margin:22px 0 0;">Talk soon,<br/><span style="font-family:${F_SERIF};font-size:16px;">Dan Adelusi</span><br/><span style="color:${B.muted};font-size:13px;">AI Engineer · Co-founder, Mabi Labs</span></p>
      `,
    }),
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
    html: shell({
      preheader: "That slot didn't work out — pick another time in one click.",
      body: `
        ${h1(`Hi ${esc(firstName)},`)}
        <p>Thanks for requesting a free AI setup session. I couldn't take this one — the slot didn't work out on my end.</p>
        ${b.rebookUrl ? `<div style="margin:26px 0;">${btn(esc(b.rebookUrl), "Pick another time")}</div>` : ""}
        <p>In the meantime, my content on <a href="https://www.instagram.com/dankunleai" style="color:${B.accent};text-decoration:none;">Instagram</a> and <a href="https://www.tiktok.com/@dkl612" style="color:${B.accent};text-decoration:none;">TikTok</a> covers a lot of what we'd discuss.</p>
        <p style="margin:22px 0 0;">Thanks for your patience,<br/><span style="font-family:${F_SERIF};font-size:16px;">Dan Adelusi</span><br/><span style="color:${B.muted};font-size:13px;">AI Engineer · Co-founder, Mabi Labs</span></p>
      `,
    }),
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
    html: shell({
      preheader: `${b.packTitle} — everything from our session, ready to use.`,
      body: `
        ${h1(`As promised, ${esc(firstName)}.`)}
        <p>Great session — here's the resource pack I promised:</p>
        ${slotCard(`${esc(b.packTitle)}<br/><span style="font-family:${F_SANS};font-size:13px;color:${B.muted};">${esc(b.packBlurb)}</span>`)}
        <div style="margin:26px 0;">${btn(esc(b.packUrl), "Open the pack")}</div>
        <p>If it helps you, a quick review or a share means a lot — and if you know someone who needs the same setup, send them my way.</p>
        <p style="margin:22px 0 0;"><span style="font-family:${F_SERIF};font-size:16px;">Dan Adelusi</span><br/><span style="color:${B.muted};font-size:13px;">AI Engineer · Co-founder, Mabi Labs</span></p>
      `,
    }),
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
