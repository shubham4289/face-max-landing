import { NextResponse } from 'next/server';
import { getSession, clearSession } from '@/app/lib/cookies';
import { sql } from '@/app/lib/db';
import { hashToken } from '@/app/lib/crypto';
import { ensureTables } from '@/app/lib/bootstrap';

export async function GET(req: Request) {
  await ensureTables();
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await sql`SELECT id FROM sessions WHERE user_id = ${session.userId} AND token_hash = ${hashToken(session.token)} AND expires_at > now()`;
  if (rows.length === 0) {
    clearSession();
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ name: session.name, email: session.email });
}
