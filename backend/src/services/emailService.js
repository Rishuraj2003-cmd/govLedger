import { Resend } from "resend";
import nodemailer from "nodemailer";

/* ─────────────────────────────────────────────────────────
   PRIMARY: Resend HTTP API  (works on Render, Vercel, etc.)
   Set RESEND_API_KEY in your environment to enable this.
   Free tier: 3,000 emails / month — https://resend.com
   ───────────────────────────────────────────────────────── */
async function sendViaResend({ email, otp, purpose, name }) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    // Use your verified domain once configured; for now Resend sandbox works for any "to" address
    from: process.env.MAIL_FROM || "Bihar Fund Tracker <onboarding@resend.dev>",
    to: [email],
    subject: `Bihar Fund Tracker — ${purpose} OTP`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px;">
        <h2 style="color:#0d4f6c;margin-bottom:8px;">Bihar Fund Tracker</h2>
        <p style="color:#475569;">Hello <strong>${name}</strong>,</p>
        <p style="color:#475569;">Your OTP for <strong>${purpose}</strong> is:</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#0d4f6c;background:#f0f9ff;border-radius:8px;padding:16px 24px;text-align:center;margin:16px 0;">
          ${otp}
        </div>
        <p style="color:#64748b;font-size:13px;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="color:#94a3b8;font-size:11px;">Bihar State Government Fund Tracker &mdash; Confidential</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }
}

/* ─────────────────────────────────────────────────────────
   FALLBACK: Nodemailer SMTP  (for local development only)
   Note: Render free tier blocks port 587 — use Resend for prod.
   ───────────────────────────────────────────────────────── */
function getSmtpTransporter() {
  // Gmail service shorthand (SMTP_SERVICE=Gmail)
  if (process.env.SMTP_SERVICE && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Custom SMTP host/port
  if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return null;
}

async function sendViaSmtp({ email, otp, purpose, name }) {
  const transporter = getSmtpTransporter();
  if (!transporter) {
    throw new Error("No SMTP transporter configured");
  }

  const sendMailPromise = transporter.sendMail({
    from: process.env.MAIL_FROM || "no-reply@biharfundtracker.local",
    to: email,
    subject: `Bihar Fund Tracker ${purpose} OTP`,
    text: `Hello ${name}, your OTP for ${purpose} is ${otp}. It is valid for 10 minutes.`,
    html: `<p>Hello ${name},</p><p>Your OTP for <strong>${purpose}</strong> is:</p><h2>${otp}</h2><p>It is valid for 10 minutes.</p>`,
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Email timeout after 15s — SMTP may be blocked by hosting provider")), 15000)
  );

  await Promise.race([sendMailPromise, timeoutPromise]);
}

/* ─────────────────────────────────────────────────────────
   PUBLIC API
   ───────────────────────────────────────────────────────── */
export async function sendOtpEmail({ email, otp, purpose, name }) {
  // 1. Resend (preferred for all cloud deployments)
  if (process.env.RESEND_API_KEY) {
    try {
      await sendViaResend({ email, otp, purpose, name });
      console.log(`✅ OTP email sent via Resend to ${email}`);
      return;
    } catch (error) {
      console.error("❌ Resend failed:", error.message);
      // fall through to SMTP
    }
  }

  // 2. SMTP (local dev / fallback)
  const hasSmtp = (process.env.SMTP_SERVICE || process.env.SMTP_HOST) && process.env.SMTP_USER && process.env.SMTP_PASS;
  if (hasSmtp) {
    try {
      await sendViaSmtp({ email, otp, purpose, name });
      console.log(`✅ OTP email sent via SMTP to ${email}`);
      return;
    } catch (error) {
      console.error("❌ SMTP failed:", error.message);
      // fall through to console log
    }
  }

  // 3. Dev console fallback (no config at all)
  console.warn("⚠️  No email provider configured (set RESEND_API_KEY for production).");
  console.log(`\n📧 OTP EMAIL (dev fallback)\n  To: ${email}\n  Name: ${name}\n  Purpose: ${purpose}\n  OTP: ${otp}\n  Valid for: 10 minutes\n`);
}
