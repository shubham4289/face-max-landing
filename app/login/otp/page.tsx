"use client";
import { useState } from "react";

export default function OtpPage() {
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("Verifying… (API next step)");
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
        />
        <button
          type="submit"
          className="w-full rounded bg-slate-900 py-2 text-white"
        >
          Verify OTP
        </button>
        {message && (
          <p className="text-center text-sm">{message}</p>
        )}
      </form>
    </div>
  );
}

