import { NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { verifyPassword, hashToken, randomId } from '@/app/lib/crypto';
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
  const password = (body.password || '').trim();
  if (!email || !password) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const users = await sql`SELECT id, name, email, password_hash, email_verified_at FROM users WHERE email = ${email}`;
  const user = users[0];
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
  if (!user.email_verified_at) return NextResponse.json({ error: 'Email not verified' }, { status: 403 });

  const code = generateOtp();
  await sql`INSERT INTO otps(id, user_id, code_hash, purpose, expires_at) VALUES(${randomId()}, ${user.id}, ${hashToken(code)}, 'login', ${expiresIn(10)})`;
  await sendEmail(email, 'Your login code', `<p>Your login code is <b>${code}</b></p>`);

  return NextResponse.json({ otpRequired: true });
}
