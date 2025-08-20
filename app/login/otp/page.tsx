'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginOtpPage() {
  const params = useSearchParams();
  const email = params.get('email') || '';
  const router = useRouter();
  const [code, setCode] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/auth/login-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.redirect) router.push(data.redirect);
    }
  }

  return (
    <form onSubmit={onSubmit} className="p-4 flex flex-col gap-2 max-w-sm mx-auto">
      <p className="text-sm">Check your email for a code.</p>
      <input
        placeholder="Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="border p-2"
      />
      <button type="submit" className="bg-black text-white p-2">
        Continue
      </button>
    </form>
  );
}
