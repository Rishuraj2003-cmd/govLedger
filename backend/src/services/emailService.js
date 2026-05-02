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

  try {
    // Set a timeout for email sending to prevent hanging
    const sendMailPromise = transporter.sendMail({
      from: process.env.MAIL_FROM || "no-reply@biharfundtracker.local",
      to: email,
      subject: `Bihar Fund Tracker ${purpose} OTP`,
      text: `Hello ${name}, your OTP for ${purpose} is ${otp}. It is valid for 10 minutes.`,
      html: `<p>Hello ${name},</p><p>Your OTP for <strong>${purpose}</strong> is:</p><h2>${otp}</h2><p>It is valid for 10 minutes.</p>`,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Email timeout")), 15000)
    );

    await Promise.race([sendMailPromise, timeoutPromise]);
    console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error.message);
    // In production, we still log it so admins can see the OTP if needed during debugging
    console.log(`⚠️ FALLBACK OTP for ${email}: ${otp}`);
    // We don't throw the error because we want the user to reach the OTP entry screen
    // They can then ask for a resend if the email eventually arrives or we can help them.
  }
}
