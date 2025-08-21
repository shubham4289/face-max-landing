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
  await ensureTables();

  const sections = (await sql`
    SELECT id, title, order_index
    FROM sections
    ORDER BY order_index ASC, created_at ASC;
  `) as SectionRow[];

  const lectures = (await sql`
    SELECT id, section_id, title, order_index, video_id, duration_min
    FROM lectures
    ORDER BY section_id ASC, order_index ASC, created_at ASC;
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
}

