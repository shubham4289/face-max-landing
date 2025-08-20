import { NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { hashPassword, hashToken } from '@/app/lib/crypto';
import { ensureTables } from '@/app/lib/bootstrap';

export async function POST(req: Request) {
  await ensureTables();
  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  const email = (body.email || '').trim().toLowerCase();
  const code = (body.code || '').trim();
  const newPassword = (body.newPassword || '').trim();
  if (!email || !code || !newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const users = await sql`SELECT id FROM users WHERE email = ${email}`;
  const user = users[0];
  if (!user) return NextResponse.json({ error: 'Invalid code' }, { status: 400 });

  const otps = await sql`SELECT id, code_hash FROM otps WHERE user_id = ${user.id} AND purpose = 'reset' AND consumed_at IS NULL AND expires_at > now() ORDER BY created_at DESC LIMIT 1`;
  const otp = otps[0];
  if (!otp || otp.code_hash !== hashToken(code)) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
  }

  const passwordHash = await hashPassword(newPassword);
  await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${user.id}`;
  await sql`UPDATE otps SET consumed_at = now() WHERE id = ${otp.id}`;

  return NextResponse.json({ ok: true });
}
