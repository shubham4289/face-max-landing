export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { ensureTables } from '@/app/lib/bootstrap';
import { verifyPassword, hashToken } from '@/app/lib/crypto';
import { generateOtp, expiresIn } from '@/app/lib/otp';
import { sendEmail } from '@/app/lib/email';

export async function POST(req: Request) {
  await ensureTables;
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  const rows = (await sql`SELECT id, name, password_hash FROM users WHERE email=${email.toLowerCase()} LIMIT 1;`) as { id: string; name: string; password_hash: string }[];
  if (rows.length === 0) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  const user = rows[0];
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const code = generateOtp(6);
  const exp = expiresIn(10);
  await sql`INSERT INTO otps(user_id, code_hash, purpose, expires_at) VALUES(${user.id}, ${hashToken(code)}, 'login', ${exp});`;

  await sendEmail(email, 'Your FaceMax login code', `
    <p>Hello ${user.name},</p>
    <p>Your login code is: <b style="font-size:18px">${code}</b></p>
    <p>This code expires in 10 minutes.</p>
  `);

  return NextResponse.json({ otpRequired: true, email });
}
