'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPage() {
  const params = useSearchParams();
  const email = params.get('email') || '';
  const router = useRouter();
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/auth/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });
    if (res.ok) {
      router.push('/login');
    }
  }

  return (
    <form onSubmit={onSubmit} className="p-4 flex flex-col gap-2 max-w-sm mx-auto">
      <p className="text-sm">Reset password for {email}</p>
      <input
        placeholder="Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="border p-2"
      />
      <input
        placeholder="New Password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="border p-2"
      />
      <button type="submit" className="bg-black text-white p-2">
        Reset Password
      </button>
    </form>
  );
}
