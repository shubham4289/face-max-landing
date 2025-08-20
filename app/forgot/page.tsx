'use client';
import { useState } from 'react';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/auth/forgot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} className="p-4 flex flex-col gap-2 max-w-sm mx-auto">
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2"
      />
      <button type="submit" className="bg-black text-white p-2">
        Send reset code
      </button>
      {sent && <p className="text-sm">If account exists, email sent.</p>}
    </form>
  );
}
