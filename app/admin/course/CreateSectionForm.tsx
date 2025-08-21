'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateSectionForm({ nextIndex }: { nextIndex: number }) {
  const [title, setTitle] = useState('');
  const [orderIndex, setOrderIndex] = useState(String(nextIndex));
  const [error, setError] = useState('');
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/admin/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, orderIndex: Number(orderIndex) }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) {
      setError(data?.error || 'Failed to create section');
      return;
    }
    setTitle('');
    setOrderIndex(String(nextIndex + 1));
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Title</label>
      <input
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        placeholder="e.g. Basic Anatomy for Implantology"
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
      {error && <p style={{ color: '#ef4444', marginBottom: 12 }}>{error}</p>}
      <button
        type="submit"
        style={{ background: '#111827', color: '#fff', borderRadius: 8, padding: '10px 14px', fontWeight: 600 }}
      >
        Create Section
      </button>
    </form>
  );
}

