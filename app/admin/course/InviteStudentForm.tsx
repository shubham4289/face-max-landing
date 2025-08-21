'use client';

import { useState } from 'react';

export default function InviteStudentForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    const res = await fetch('/api/admin/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) {
      setError(data?.error || 'Failed to send invite');
      return;
    }
    setSuccess('Invite sent');
    setEmail('');
    setName('');
  }

  return (
    <form onSubmit={onSubmit}>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Email</label>
      <input
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="student@example.com"
        style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px' }}
      />
      <div style={{ height: 12 }} />
      <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Name (optional)</label>
      <input
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Jane Doe"
        style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px' }}
      />
      <div style={{ height: 12 }} />
      {error && <p style={{ color: '#ef4444', marginBottom: 12 }}>{error}</p>}
      {success && <p style={{ color: '#10b981', marginBottom: 12 }}>{success}</p>}
      <button
        type="submit"
        style={{ background: '#111827', color: '#fff', borderRadius: 8, padding: '10px 14px', fontWeight: 600 }}
      >
        Send Invite
      </button>
    </form>
  );
}
