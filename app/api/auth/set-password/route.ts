export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { ensureTables } from '@/app/lib/bootstrap';
import { hashPassword, hashToken } from '@/app/lib/crypto';
import { setSession } from '@/app/lib/cookies';

export async function POST(req: Request) {
  await ensureTables();
  const { token, password } = await req.json();
  if (!token || !password)
    return NextResponse.json(
      { error: 'Token and password required' },
      { status: 400 }
    );

  const tokenHash = hashToken(token);
  const rows = (await sql`
    SELECT pr.id, pr.user_id, pr.expires_at, pr.consumed_at, u.name, u.email
    FROM password_resets pr
    JOIN users u ON pr.user_id = u.id
    WHERE pr.token_hash=${tokenHash}
    LIMIT 1;
  `) as {
    id: string;
    user_id: string;
    expires_at: string;
    consumed_at: string | null;
    name: string;
    email: string;
  }[];

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  const row = rows[0];
  if (row.consumed_at || new Date(row.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Expired token' }, { status: 400 });
  }

  const hash = await hashPassword(password);
  await sql`UPDATE users SET password_hash=${hash} WHERE id=${row.user_id};`;
  await sql`UPDATE password_resets SET consumed_at=now() WHERE id=${row.id};`;

  setSession({ userId: row.user_id, name: row.name, email: row.email });
  return NextResponse.json({ ok: true, redirect: '/course' });
}
