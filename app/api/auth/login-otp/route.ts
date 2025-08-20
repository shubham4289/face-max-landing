import { NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { hashToken, randomId } from '@/app/lib/crypto';
import { setSession } from '@/app/lib/cookies';
import { ensureTables } from '@/app/lib/bootstrap';

export async function POST(req: Request) {
  await ensureTables();
  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  const email = (body.email || '').trim().toLowerCase();
  const code = (body.code || '').trim();
  if (!email || !code) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const users = await sql`SELECT id, name, email FROM users WHERE email = ${email}`;
  const user = users[0];
  if (!user) return NextResponse.json({ error: 'Invalid code' }, { status: 400 });

  const otps = await sql`SELECT id, code_hash FROM otps WHERE user_id = ${user.id} AND purpose = 'login' AND consumed_at IS NULL AND expires_at > now() ORDER BY created_at DESC LIMIT 1`;
  const otp = otps[0];
  if (!otp || otp.code_hash !== hashToken(code)) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
  }

  await sql`UPDATE otps SET consumed_at = now() WHERE id = ${otp.id}`;

  const token = randomId();
  const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await sql`INSERT INTO sessions(id, user_id, token_hash, expires_at) VALUES(${randomId()}, ${user.id}, ${hashToken(token)}, ${sessionExpires})`;
  setSession({ token, userId: user.id, name: user.name, email: user.email });

  return NextResponse.json({ ok: true, redirect: '/course' });
}
