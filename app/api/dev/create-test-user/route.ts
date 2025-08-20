import { NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { ensureTables } from '@/app/lib/bootstrap';
import { hashPassword } from '@/app/lib/crypto';
import { randomId } from '@/app/lib/crypto';

export async function POST(req: Request) {
  await ensureTables();
  const { name, email, password } = await req.json();
  if (!name || !email || !password) return NextResponse.json({ error: 'name, email, password required' }, { status: 400 });
  const id = randomId();
  const pw = await hashPassword(password);
  try {
    await sql`INSERT INTO users(id, email, name, password_hash) VALUES(${id}, ${email.toLowerCase()}, ${name}, ${pw});`;
    return NextResponse.json({ ok: true, userId: id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
