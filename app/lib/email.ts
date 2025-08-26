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

// Backwards compatibility
export { sendMail as sendEmail };
