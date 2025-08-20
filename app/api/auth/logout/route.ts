import { NextResponse } from 'next/server';
import { getSession, clearSession } from '@/app/lib/cookies';
import { sql } from '@/app/lib/db';
import { hashToken } from '@/app/lib/crypto';
import { ensureTables } from '@/app/lib/bootstrap';

export async function POST(req: Request) {
  await ensureTables();
  const session = getSession(req);
  if (session) {
    await sql`DELETE FROM sessions WHERE user_id = ${session.userId} AND token_hash = ${hashToken(session.token)}`;
  }
  clearSession();
  return NextResponse.json({ ok: true });
}
