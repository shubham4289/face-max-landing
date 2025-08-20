import { NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { hashToken, randomId } from '@/app/lib/crypto';
import { generateOtp, expiresIn } from '@/app/lib/otp';
import { sendEmail } from '@/app/lib/email';
import { ensureTables } from '@/app/lib/bootstrap';

export async function POST(req: Request) {
  await ensureTables();
  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  const email = (body.email || '').trim().toLowerCase();
  if (email) {
    const users = await sql`SELECT id FROM users WHERE email = ${email}`;
    const user = users[0];
    if (user) {
      const code = generateOtp();
      await sql`INSERT INTO otps(id, user_id, code_hash, purpose, expires_at) VALUES(${randomId()}, ${user.id}, ${hashToken(code)}, 'reset', ${expiresIn(10)})`;
      await sendEmail(email, 'Password reset code', `<p>Your password reset code is <b>${code}</b></p>`);
    }
  }
  return NextResponse.json({ ok: true });
}
