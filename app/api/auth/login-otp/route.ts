import { NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { ensureTables } from '@/app/lib/bootstrap';
import { hashToken } from '@/app/lib/crypto';
import { setSession } from '@/app/lib/cookies';

export async function POST(req: Request) {
  await ensureTables();
  const { email, code } = await req.json();
  if (!email || !code) return NextResponse.json({ error: 'Email and code required' }, { status: 400 });
  const users = (await sql`SELECT id, name, email FROM users WHERE email=${email.toLowerCase()} LIMIT 1;`) as { id: string; name: string; email: string }[];
  if (users.length === 0) return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
  const u = users[0];

  const otps = (await sql`
    SELECT id, expires_at, consumed_at FROM otps
    WHERE user_id=${u.id} AND purpose='login'
    ORDER BY created_at DESC LIMIT 5;
  `) as { id: string; expires_at: string; consumed_at: string | null }[];
  // Check the latest non-consumed OTP
  const now = new Date();
  let validId: string | null = null;
  for (const o of otps) {
    if (o.consumed_at) continue;
    const exp = new Date(o.expires_at);
    if (exp < now) continue;
    // compare hash
    const [{ ok }] = (await sql`SELECT ${hashToken(code)} = code_hash as ok FROM otps WHERE id=${o.id};`) as { ok: boolean }[];
    if (ok) { validId = o.id; break; }
  }
  if (!validId) return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });

  await sql`UPDATE otps SET consumed_at=now() WHERE id=${validId};`;
  setSession({ userId: u.id, name: u.name, email: u.email });
  return NextResponse.json({ ok: true, redirect: '/course' });
}
