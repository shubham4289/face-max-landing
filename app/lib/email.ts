// app/lib/email.ts
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.error('Missing RESEND_API_KEY in environment variables');
}
const resend = new Resend(resendApiKey);

export async function sendMail(to: string, subject: string, html: string) {
  const from = process.env.RESEND_FROM || process.env.EMAIL_FROM;
  if (!process.env.RESEND_API_KEY || !from) {
    throw new Error('Missing RESEND_API_KEY or RESEND_FROM');
  }
  return await resend.emails.send({
    from,
    to,
    subject,
    html,
  });
}

export async function sendWelcomeEmail({
  to,
  name,
  token,
}: {
  to: string;
  name?: string | null;
  token: string;
}) {
  const from = process.env.MAIL_FROM;
  if (!process.env.RESEND_API_KEY || !from) {
    throw new Error('Missing RESEND_API_KEY or MAIL_FROM');
  }
  const link = `https://www.thefacemax.com/auth/set-password?token=${token}`;
  const subject = 'Welcome to The Ultimate Implant Course';
  const greet = name ? `Hi ${name},` : 'Hi,';
  const html = `
    <p>${greet}</p>
    <p>Welcome to The Ultimate Implant Course.</p>
    <p><a href="${link}" style="display:inline-block;padding:10px 16px;background-color:#2563EB;color:#fff;text-decoration:none;border-radius:4px">Set your password</a></p>
  `;
  const text = `${greet}\n\nWelcome to The Ultimate Implant Course.\nSet your password: ${link}\n`;
  return await resend.emails.send({ from, to, subject, html, text });
}

// Backwards compatibility
export { sendMail as sendEmail };
