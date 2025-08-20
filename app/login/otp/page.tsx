"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function OtpPage() {
  return (
    <Suspense>
      <OtpForm />
    </Suspense>
  );
}

function OtpForm() {
  const search = useSearchParams();
  const email = search.get("email") || "";
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/auth/login-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.ok) {
        window.location.href = '/course';
      }
    } else if (res.status === 401) {
      setMessage("Invalid code");
    } else {
      setMessage("Error");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          required
          className="w-full rounded border p-2 text-center tracking-widest"
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          type="submit"
          className="w-full rounded bg-slate-900 py-2 text-white"
        >
          Verify OTP
        </button>
        {message && <p className="text-center text-sm">{message}</p>}
      </form>
    </div>
  );
}
