// app/api/admin/lectures/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { ensureTables } from '@/app/lib/bootstrap';
import { assertAdmin } from '@/app/lib/admin';
import { randomId } from '@/app/lib/crypto';

type Body = {
  id?: string; // if given, we update; else create
  sectionId: string;
  title: string;
  orderIndex?: number;
  videoId?: string;
  durationMin?: number;
};

export async function POST(req: Request) {
  try {
    assertAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, sectionId, title, orderIndex = 0, videoId = null, durationMin = 0 } =
    (await req.json()) as Body;
  if (!sectionId || !title) {
    return NextResponse.json({ error: 'sectionId and title required' }, { status: 400 });
  }

  await ensureTables();

  if (id) {
    await sql`
      UPDATE lectures
      SET section_id=${sectionId},
          title=${title},
          order_index=${orderIndex},
          video_id=${videoId},
          duration_min=${durationMin}
      WHERE id=${id};
    `;
    return NextResponse.json({ ok: true, id, updated: true });
  }

  const newId = randomId();
  await sql`
    INSERT INTO lectures (id, section_id, title, order_index, video_id, duration_min)
    VALUES (${newId}, ${sectionId}, ${title}, ${orderIndex}, ${videoId}, ${durationMin});
  `;
  return NextResponse.json({ ok: true, id: newId, created: true });
}

export async function GET() {
  try {
    assertAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rows = await sql`
    SELECT l.id, l.section_id, l.title, l.order_index, l.video_id, l.duration_min
    FROM lectures l
    ORDER BY l.order_index ASC, l.created_at ASC;
  `;
  return NextResponse.json(rows);
}
