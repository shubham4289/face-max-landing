// app/lib/course-data.ts
import 'server-only';
import { sql } from '@/app/lib/db';
import { ensureTables } from '@/app/lib/bootstrap';

export type LectureRow = {
  id: string;
  section_id: string;
  title: string;
  order_index: number;
  video_id: string | null;
  duration_min: number | null;
};

export type SectionRow = {
  id: string;
  title: string;
  order_index: number;
};

export type CourseData = Array<{
  id: string;
  title: string;
  order: number;
  lectures: Array<{
    id: string;
    title: string;
    order: number;
    videoId: string | null;
    duration: string; // e.g., "7m"
  }>;
}>;

export async function getCourseData(): Promise<CourseData> {
  try {
    await ensureTables();

    const sections = (await sql`
      SELECT id, title, order_index
      FROM sections
      ORDER BY order_index ASC, created_at ASC;
    `) as SectionRow[];

    const lectures = (await sql`
      SELECT l.id, l.section_id, l.title, l.order_index, l.video_id, l.duration_min
      FROM lectures l
      JOIN sections s ON l.section_id = s.id
      ORDER BY s.order_index ASC, l.order_index ASC, l.created_at ASC;
    `) as LectureRow[];

    const bySection: Record<string, LectureRow[]> = {};
    for (const l of lectures) {
      (bySection[l.section_id] ||= []).push(l);
    }

    return sections.map((s) => ({
      id: s.id,
      title: s.title,
      order: s.order_index,
      lectures: (bySection[s.id] || []).map((l) => ({
        id: l.id,
        title: l.title,
        order: l.order_index,
        videoId: l.video_id,
        duration: l.duration_min ? `${l.duration_min}m` : '—',
      })),
    }));
  } catch (err) {
    console.error('[course-data] failed:', err);
    return [];
  }
}

