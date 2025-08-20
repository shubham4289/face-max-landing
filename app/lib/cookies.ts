// app/lib/cookies.ts
import { cookies } from "next/headers";

export type Session = {
  userId: string;
  name: string;
  email: string;
};

export function getSession(): Session | null {
  const raw = cookies().get("session")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session; // matches setSession({ userId, name, email })
  } catch {
    return null;
  }
}

// (you already have setSession in this file, keep it as-is)
