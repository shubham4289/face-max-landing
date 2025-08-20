import { NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { hashPassword, hashToken, randomId } from '@/app/lib/crypto';
import { generateOtp, expiresIn } from '@/app/lib/otp';
import { sendEmail } from '@/app/lib/email';
import { ensureTables } from '@/app/lib/bootstrap';

export async function POST(req: Request) {
  await ensureTables();
  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  const name = (body.name || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const password = (body.password || '').trim();

  if (!name || !email || !password || password.length < 8) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: 'User exists' }, { status: 409 });
  }

  const userId = randomId();
  const passwordHash = await hashPassword(password);
  await sql`INSERT INTO users(id,email,name,password_hash) VALUES(${userId},${email},${name},${passwordHash})`;

  const code = generateOtp();
  await sql`INSERT INTO otps(id,user_id,code_hash,purpose,expires_at) VALUES(${randomId()},${userId},${hashToken(code)},'verify',${expiresIn(10)})`;

  await sendEmail(
    email,
    'Verify your account',
    `<p>Your verification code is <b>${code}</b></p><p><a href="${process.env.APP_URL}/verify?email=${encodeURIComponent(
      email
    )}">Verify your account</a></p>`
  );

  return NextResponse.json({ ok: true });
}
