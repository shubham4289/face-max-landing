"use client";

import { useState } from "react";

interface SetPasswordFormProps {
  token: string;
}

export default function SetPasswordForm({ token }: SetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    const res = await fetch("/api/auth/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    setMessage(res.ok ? "Password updated" : "Error");
  }

  return (
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
      <input
        type="password"
        required
        placeholder="Confirm password"
        className="w-full rounded border p-2"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button
        type="submit"
        className="w-full rounded bg-slate-900 py-2 text-white"
      >
        Set Password
      </button>
      {message && <p className="text-center text-sm">{message}</p>}
    </form>
  );
}

