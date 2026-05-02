/* ─────────────────────────────────────────────────────────────────────────────
   emailService.js
   Priority order:
     1. Brevo HTTP API  — free, no domain needed, works on Render ✅
     2. Resend HTTP API — needs verified domain for non-owner emails
     3. Nodemailer SMTP — local dev only (Render blocks port 587)
     4. Console log     — dev fallback when nothing is configured
   ───────────────────────────────────────────────────────────────────────────── */
import nodemailer from "nodemailer";

/* ── 1. BREVO (recommended for Render free tier) ──────────────────────────── */
async function sendViaBrevo({ email, otp, purpose, name }) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name:  "Bihar Fund Tracker",
        email: process.env.SMTP_USER || "rr907194@gmail.com",
      },
      to: [{ email }],
      subject: `Bihar Fund Tracker — ${purpose} OTP`,
      htmlContent: `
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
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Brevo API error ${response.status}: ${err.message || response.statusText}`);
  }
}

/* ── 2. RESEND (requires verified domain for non-owner emails) ────────────── */
async function sendViaResend({ email, otp, purpose, name }) {
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: process.env.MAIL_FROM || "Bihar Fund Tracker <onboarding@resend.dev>",
    to: [email],
    subject: `Bihar Fund Tracker — ${purpose} OTP`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px;">
        <h2 style="color:#0d4f6c;">Bihar Fund Tracker</h2>
        <p>Hello <strong>${name}</strong>, your OTP for <strong>${purpose}</strong> is:</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#0d4f6c;background:#f0f9ff;border-radius:8px;padding:16px 24px;text-align:center;margin:16px 0;">${otp}</div>
        <p style="color:#64748b;font-size:13px;">Valid for <strong>10 minutes</strong>.</p>
      </div>
    `,
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
}

/* ── 3. SMTP (local dev only) ─────────────────────────────────────────────── */
function getSmtpTransporter() {
  if (process.env.SMTP_SERVICE && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return null;
}

async function sendViaSmtp({ email, otp, purpose, name }) {
  const transporter = getSmtpTransporter();
  if (!transporter) throw new Error("No SMTP transporter configured");

  await Promise.race([
    transporter.sendMail({
      from: process.env.MAIL_FROM || "no-reply@biharfundtracker.local",
      to: email,
      subject: `Bihar Fund Tracker ${purpose} OTP`,
      html: `<p>Hello ${name},</p><p>OTP for <strong>${purpose}</strong>: <h2>${otp}</h2></p><p>Valid 10 minutes.</p>`,
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error("SMTP timeout after 15s")), 15000)),
  ]);
}

/* ── PUBLIC API ───────────────────────────────────────────────────────────── */
export async function sendOtpEmail({ email, otp, purpose, name }) {
  // 1. Brevo — best for Render/cloud (no domain verification needed)
  if (process.env.BREVO_API_KEY) {
    try {
      await sendViaBrevo({ email, otp, purpose, name });
      console.log(`✅ OTP email sent via Brevo to ${email}`);
      return;
    } catch (err) {
      console.error("❌ Brevo failed:", err.message);
    }
  }

  // 2. Resend — needs verified domain for arbitrary recipients
  if (process.env.RESEND_API_KEY) {
    try {
      await sendViaResend({ email, otp, purpose, name });
      console.log(`✅ OTP email sent via Resend to ${email}`);
      return;
    } catch (err) {
      console.error("❌ Resend failed:", err.message);
    }
  }

  // 3. SMTP — local dev fallback
  const hasSmtp = (process.env.SMTP_SERVICE || process.env.SMTP_HOST) && process.env.SMTP_USER && process.env.SMTP_PASS;
  if (hasSmtp) {
    try {
      await sendViaSmtp({ email, otp, purpose, name });
      console.log(`✅ OTP email sent via SMTP to ${email}`);
      return;
    } catch (err) {
      console.error("❌ SMTP failed:", err.message);
    }
  }

  // 4. Dev console fallback
  console.warn("⚠️  No email provider configured (set BREVO_API_KEY for production).");
  console.log(`\n📧 OTP EMAIL (dev fallback)\n  To: ${email}\n  Name: ${name}\n  Purpose: ${purpose}\n  OTP: ${otp}\n  Valid for: 10 minutes\n`);
}
