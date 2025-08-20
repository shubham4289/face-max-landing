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
    return JSON.parse(raw) as Session; 
  } catch {
    return null;
  }
}

export function setSession(session: Session) {
  cookies().set("session", JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}
