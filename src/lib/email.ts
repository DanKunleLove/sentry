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
}

/** Notify Dan about a new /book submission. */
export async function notifyBookingEmail(b: BookingEmailData): Promise<boolean> {
  const waDigits = b.whatsapp.replace(/\D/g, "");
  return sendEmail({
    to: process.env.NOTIFICATION_EMAIL || undefined,
    subject: `📅 New booking request: ${b.fullName}`,
    html: `
      <h2>New free-session request from /book</h2>
      <table style="border-collapse:collapse;font-family:sans-serif;">
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Name</td><td>${esc(b.fullName)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Email</td><td><a href="mailto:${esc(b.email)}">${esc(b.email)}</a></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">WhatsApp</td><td><a href="https://wa.me/${waDigits}">${esc(b.whatsapp)}</a></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Role</td><td>${esc(b.role)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Source</td><td>${esc(b.source || "direct")}</td></tr>
      </table>
      <h3>What they need</h3>
      <p style="background:#f5f5f5;padding:12px;border-radius:8px;">${esc(b.need)}</p>
      <p style="margin-top:16px;color:#666;font-size:12px;">Approve or decline in the admin panel · ${new Date().toISOString()}</p>
    `,
  });
}

/** Tell an applicant their free session is confirmed. */
export async function bookingApprovedEmail(b: {
  fullName: string;
  email: string;
}): Promise<boolean> {
  const firstName = b.fullName.split(" ")[0];
  return sendEmail({
    to: b.email,
    fromName: "Dan Adelusi",
    subject: "Your free AI setup session is confirmed",
    html: `
      <div style="font-family:sans-serif;max-width:560px;">
        <p>Hi ${esc(firstName)},</p>
        <p>Good news — I've reviewed your request and your free AI setup session is confirmed.</p>
        <p><strong>Next steps:</strong></p>
        <ol>
          <li>I'll reach out on WhatsApp within the next day to agree a time that works for both of us.</li>
          <li>You'll get a video call link before the session. <em>[Meeting link will be shared once we've picked a time.]</em></li>
          <li>Come with your workflow or problem in mind — the more specific, the more we get done in 30 minutes.</li>
        </ol>
        <p>Talk soon,<br/>Dan Adelusi<br/>AI Engineer · Co-founder, Mabi Labs</p>
      </div>
    `,
  });
}

/** Politely decline an applicant. */
export async function bookingDeclinedEmail(b: {
  fullName: string;
  email: string;
}): Promise<boolean> {
  const firstName = b.fullName.split(" ")[0];
  return sendEmail({
    to: b.email,
    fromName: "Dan Adelusi",
    subject: "About your AI setup session request",
    html: `
      <div style="font-family:sans-serif;max-width:560px;">
        <p>Hi ${esc(firstName)},</p>
        <p>Thanks for requesting a free AI setup session. I'm currently fully booked, so I can't take your session right now.</p>
        <p>I've kept your details on file, and I'll reach out as soon as a slot opens up. In the meantime, my content on Instagram and TikTok (@dankunleai) covers a lot of what we'd discuss.</p>
        <p>Thanks for your patience,<br/>Dan Adelusi<br/>AI Engineer · Co-founder, Mabi Labs</p>
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
