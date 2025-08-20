export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { isAdmin } from '@/app/lib/admin';
import { ensureTables } from '@/app/lib/bootstrap';
import { sql } from '@/app/lib/db';

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
          <form
            action={async (formData) => {
              'use server';
              const title = String(formData.get('title') || '').trim();
              const orderIndex = Number(formData.get('orderIndex') || 0);
              await fetch(`${process.env.APP_URL || ''}/api/admin/sections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, orderIndex }),
                cache: 'no-store',
              });
            }}
          >
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Title</label>
            <input
              name="title"
              required
              placeholder="e.g. Basic Anatomy for Implantology"
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px' }}
            />
            <div style={{ height: 12 }} />
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Order Index</label>
            <input
              type="number"
              name="orderIndex"
              defaultValue={sections.length}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px' }}
            />
            <div style={{ height: 12 }} />
            <button
              type="submit"
              style={{ background: '#111827', color: '#fff', borderRadius: 8, padding: '10px 14px', fontWeight: 600 }}
            >
              Create Section
            </button>
          </form>
        </section>

        {/* Add/Update Lecture */}
        <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Add / Update Lecture</h2>
          <form
            action={async (formData) => {
              'use server';
              const payload = {
                id: String(formData.get('id') || '') || undefined,
                sectionId: String(formData.get('sectionId') || ''),
                title: String(formData.get('title') || ''),
                orderIndex: Number(formData.get('orderIndex') || 0),
                videoId: String(formData.get('videoId') || '') || undefined,
                durationMin: Number(formData.get('durationMin') || 0),
              };
              await fetch(`${process.env.APP_URL || ''}/api/admin/lectures`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                cache: 'no-store',
              });
            }}
          >
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Section</label>
            <select
              name="sectionId"
              required
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px' }}
            >
              <option value="">Select section…</option>
              {sections.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.order_index}. {s.title}
                </option>
              ))}
            </select>

            <div style={{ height: 12 }} />
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Lecture Title</label>
            <input
              name="title"
              required
              placeholder="e.g. What is a dental implant?"
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px' }}
            />
            <div style={{ height: 12 }} />

            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Order Index</label>
            <input
              type="number"
              name="orderIndex"
              defaultValue={0}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px' }}
            />
            <div style={{ height: 12 }} />

            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>VdoCipher videoId</label>
            <input
              name="videoId"
              placeholder="e.g. 056ef4706ec54b21baa09deccbb710f7"
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px' }}
            />
            <div style={{ height: 12 }} />

            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Duration (min) — optional</label>
            <input
              type="number"
              name="durationMin"
              defaultValue={0}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px' }}
            />

            {/* Hidden for updates (paste an existing lecture id if you are editing) */}
            <input type="hidden" name="id" />

            <div style={{ height: 12 }} />
            <button
              type="submit"
              style={{ background: '#111827', color: '#fff', borderRadius: 8, padding: '10px 14px', fontWeight: 600 }}
            >
              Save Lecture
            </button>
          </form>
        </section>
      </div>

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
