// app/api/admin/sections/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { ensureTables } from '@/app/lib/bootstrap';
import { assertAdmin } from '@/app/lib/admin';
import { randomId } from '@/app/lib/crypto';

type Body = { title: string; orderIndex?: number };

export async function POST(req: Request) {
  try {
    assertAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, orderIndex = 0 } = (await req.json()) as Body;
  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });

  await ensureTables();
  const id = randomId();
  await sql`INSERT INTO sections (id, title, order_index) VALUES (${id}, ${title}, ${orderIndex});`;
  return NextResponse.json({ ok: true, id });
}

export async function GET() {
  try {
    assertAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rows = await sql`SELECT id, title, order_index FROM sections ORDER BY order_index ASC, created_at ASC;`;
  return NextResponse.json(rows);
}
