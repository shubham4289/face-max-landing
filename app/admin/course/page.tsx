export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { isAdmin } from '@/app/lib/admin';
import { ensureTables } from '@/app/lib/bootstrap';
import { sql } from '@/app/lib/db';
import CreateSectionForm from './CreateSectionForm';
import CreateLectureForm from './CreateLectureForm';
import InviteStudentForm from './InviteStudentForm';

export default async function AdminCoursePage() {
  if (!isAdmin()) {
    return <div style={{ padding: 24 }}>Unauthorized</div>;
  }

  await ensureTables();
  const { sections, lectures } = await getData();

  return (
    <main style={{ maxWidth: 960, margin: '40px auto', padding: '0 16px', fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Admin · Course Builder</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Create Section */}
        <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Create Section</h2>
          <CreateSectionForm nextIndex={sections.length} />
        </section>

        {/* Add/Update Lecture */}
        <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Add / Update Lecture</h2>
          <CreateLectureForm sections={sections} />
        </section>
      </div>

      <div style={{ height: 24 }} />

      {/* Invite Student */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, maxWidth: 400 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Invite Student</h2>
        <InviteStudentForm />
      </section>

      <div style={{ height: 28 }} />
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Current Structure</h2>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
        {sections.map((s: any) => {
          const ls = lectures.filter((l: any) => l.section_id === s.id);
          return (
            <div key={s.id} style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 700 }}>
                {s.order_index}. {s.title}
              </div>
              <ol style={{ marginTop: 8, marginLeft: 16 }}>
                {ls.map((l: any) => (
                  <li key={l.id} style={{ marginBottom: 6 }}>
                    <code style={{ background: '#f3f4f6', padding: '1px 6px', borderRadius: 6, marginRight: 8 }}>
                      {l.video_id || 'no-video'}
                    </code>
                    {l.order_index}. {l.title}
                    {l.duration_min ? <span style={{ color: '#6b7280' }}> — {l.duration_min}m</span> : null}
                  </li>
                ))}
                {ls.length === 0 && <li style={{ color: '#6b7280' }}>No lectures yet</li>}
              </ol>
            </div>
          );
        })}
      </div>
    </main>
  );
}
async function getData() {
  const sections = (await sql`
    SELECT id, title, order_index
    FROM sections
    ORDER BY order_index ASC, created_at ASC;
  `) as Array<{ id: string; title: string; order_index: number }>;

  const lectures = (await sql`
    SELECT id, section_id, title, order_index, video_id, duration_min
    FROM lectures
    ORDER BY order_index ASC, created_at ASC;
  `) as Array<{
    id: string;
    section_id: string;
    title: string;
    order_index: number;
    video_id: string | null;
    duration_min: number | null;
  }>;

  return { sections, lectures };
}
