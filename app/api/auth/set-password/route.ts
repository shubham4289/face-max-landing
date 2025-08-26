export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { ensureTables } from '@/app/lib/bootstrap';
import { hashPassword, consumePasswordToken } from '@/app/lib/crypto';
import { setSession } from '@/app/lib/cookies';

export async function POST(req: Request) {
  await ensureTables();
  const { token, password } = await req.json().catch(() => ({}) as any);
  if (!token || !password) {
    return NextResponse.json(
      { error: 'Token and password required' },
      { status: 400 }
    );
  }

  const consumed = await consumePasswordToken(token, 'set');
  if (!consumed) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }

  const users = (await sql`
    SELECT id, name FROM users WHERE email=${consumed.email} LIMIT 1;
  `) as { id: string; name: string }[];
  if (users.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 400 });
  }

  const user = users[0];
  const hash = await hashPassword(password);
  await sql`UPDATE users SET password_hash=${hash} WHERE id=${user.id};`;

  setSession({ userId: user.id, name: user.name, email: consumed.email });
  return NextResponse.json({ ok: true, redirect: '/course' });
}
