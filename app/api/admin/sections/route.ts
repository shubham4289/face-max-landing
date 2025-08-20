// app/api/admin/sections/route.ts
import { NextResponse } from 'next/server';
import { assertAdmin } from '@/app/lib/admin';
// ...other imports...

export async function POST(req: Request) {
  try {
    assertAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ...create section...
  return NextResponse.json({ ok: true });
}

  const { title, orderIndex = 0 } = await req.json() as {
    title: string;
    orderIndex?: number;
  };
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  await ensureTables();
  const id = randomId();
  await sql`INSERT INTO sections (id, title, order_index) VALUES (${id}, ${title}, ${orderIndex});`;
  return NextResponse.json({ ok: true, id });
}

export async function GET() {
  try {
    requireAdminEmail();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await sql`SELECT id, title, order_index FROM sections ORDER BY order_index ASC, created_at ASC;`;
  return NextResponse.json(rows);
}
