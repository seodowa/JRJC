
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  logger: false,
  debug: false,
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-login?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify your login',
    html: `<p>Click <a href="${verificationLink}">here</a> to verify your login.</p>`,
  });
}

export async function sendOtpEmail(email: string, otp: string, expires: Date) {
  const now = new Date();
  const diffInMs = expires.getTime() - now.getTime();
  const diffInMinutes = Math.round(diffInMs / 60000);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Your OTP Code',
    html: `<p>Your OTP code is: <strong>${otp}</strong>. It will expire in <strong>${diffInMinutes}</strong> minutes.</p>`,
  });
}
