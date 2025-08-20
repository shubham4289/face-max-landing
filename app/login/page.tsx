"use client";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("Submitting… (API will be added in the next step)");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          className="w-full rounded border p-2"
        />
        <input
          type="password"
          required
          placeholder="Password"
          className="w-full rounded border p-2"
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
            href="/forgot"
            className="text-sm text-slate-600 underline"
          >
            Forgot password?
          </Link>
        </div>
      </form>
    </div>
  );
}

