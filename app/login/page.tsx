'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.otpRequired) {
        router.push(`/login/otp?email=${encodeURIComponent(form.email)}`);
      }
    }
  }

  return (
    <form onSubmit={onSubmit} className="p-4 flex flex-col gap-2 max-w-sm mx-auto">
      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="border p-2"
      />
      <input
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        className="border p-2"
      />
      <button type="submit" className="bg-black text-white p-2">
        Login
      </button>
    </form>
  );
}
