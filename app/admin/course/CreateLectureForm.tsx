'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Section {
  id: string;
  title: string;
  order_index: number;
}

export default function CreateLectureForm({ sections }: { sections: Section[] }) {
  const [sectionId, setSectionId] = useState('');
  const [title, setTitle] = useState('');
  const [orderIndex, setOrderIndex] = useState('0');
  const [videoId, setVideoId] = useState('');
  const [duration, setDuration] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const payload = {
      sectionId,
      title: title.trim(),
      orderIndex: Number(orderIndex || 0),
      videold: videoId.trim(),
      durationMin: duration ? Number(duration) : undefined,
    };
    const res = await fetch('/api/admin/lectures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) {
      setError(data?.error || 'Failed to save lecture');
      return;
    }
    setSectionId('');
    setTitle('');
    setOrderIndex('0');
    setVideoId('');
    setDuration('');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Section</label>
      <select
        name="sectionId"
        required
        value={sectionId}
        onChange={(e) => setSectionId(e.target.value)}
        style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px' }}
      >
        <option value="">Select section…</option>
        {sections.map((s) => (
          <option key={s.id} value={s.id}>
            {s.order_index}. {s.title}
          </option>
        ))}
      </select>

      <div style={{ height: 12 }} />
      <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Lecture Title</label>
      <input
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        placeholder="e.g. What is a dental implant?"
        style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px' }}
      />
      <div style={{ height: 12 }} />

      <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Order Index</label>
      <input
        type="number"
        name="orderIndex"
        value={orderIndex}
        onChange={(e) => setOrderIndex(e.target.value)}
        style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px' }}
      />
      <div style={{ height: 12 }} />

      <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>VdoCipher videoId</label>
      <input
        name="videoId"
        value={videoId}
        onChange={(e) => setVideoId(e.target.value)}
        placeholder="e.g. 056ef4706ec54b21baa09deccbb710f7"
        style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px' }}
      />
      <div style={{ height: 12 }} />

      <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Duration (min) — optional</label>
      <input
        type="number"
        name="durationMin"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px' }}
      />

      <div style={{ height: 12 }} />
      {error && <p style={{ color: '#ef4444', marginBottom: 12 }}>{error}</p>}
      <button
        type="submit"
        style={{ background: '#111827', color: '#fff', borderRadius: 8, padding: '10px 14px', fontWeight: 600 }}
      >
        Save Lecture
      </button>
    </form>
  );
}

