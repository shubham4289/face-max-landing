"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/auth/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push(data.redirect);
    } else {
      setMessage(data.error || "Error");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <input type="hidden" name="token" value={token} />
        <input
          type="password"
          required
          placeholder="New password"
          className="w-full rounded border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full rounded bg-slate-900 py-2 text-white">
          Set password
        </button>
        {message && <p className="text-center text-sm">{message}</p>}
      </form>
    </div>
  );
}
