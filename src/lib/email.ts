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
}

/** Send an email via Gmail SMTP. Gracefully no-ops if SMTP not configured. */
export async function sendEmail(opts: EmailOpts): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;
  try {
    await t.sendMail({
      from: `"Sentry Agent" <${SMTP_USER}>`,
      to: opts.to ?? DAN_EMAIL,
      subject: opts.subject,
      html: opts.html,
    });
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
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
