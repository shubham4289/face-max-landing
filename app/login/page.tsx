"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.otpRequired) {
        router.push(`/login/otp?email=${encodeURIComponent(email)}`);
      }
    } else if (res.status === 401) {
      setMessage("Invalid credentials");
    } else {
      setMessage("Error");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          className="w-full rounded border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          placeholder="Password"
          className="w-full rounded border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full rounded bg-slate-900 py-2 text-white"
        >
          Continue
        </button>
        {message && (
          <p className="text-center text-sm">{message}</p>
        )}
        <div className="text-center">
          <Link
            href="/auth/forgot"
            className="text-sm text-slate-600 underline"
          >
            Forgot password?
          </Link>
        </div>
        <p className="text-center text-sm text-slate-600">
          If you purchased the course, check your email for access.
        </p>
      </form>
    </div>
  );
}
