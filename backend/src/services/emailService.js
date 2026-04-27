import nodemailer from "nodemailer";

function getTransporter() {
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

  // No SMTP configured — return null so we fall back to console logging
  return null;
}

export async function sendOtpEmail({ email, otp, purpose, name }) {
  const transporter = getTransporter();

  if (!transporter) {
    // Development fallback: log OTP to console so you can test without email
    console.warn("⚠️  SMTP not configured. OTP will be printed to console only.");
    console.log(`\n📧 OTP EMAIL (dev fallback)\n  To: ${email}\n  Name: ${name}\n  Purpose: ${purpose}\n  OTP: ${otp}\n  Valid for: 10 minutes\n`);
    return;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || "no-reply@biharfundtracker.local",
    to: email,
    subject: `Bihar Fund Tracker ${purpose} OTP`,
    text: `Hello ${name}, your OTP for ${purpose} is ${otp}. It is valid for 10 minutes.`,
    html: `<p>Hello ${name},</p><p>Your OTP for <strong>${purpose}</strong> is:</p><h2>${otp}</h2><p>It is valid for 10 minutes.</p>`,
  });
}
