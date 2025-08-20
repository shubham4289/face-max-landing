import { cookies } from 'next/headers';
type Sess = { userId: string, name: string, email: string };
const COOKIE = 'fm_session';
export function setSession(sess: Sess) {
  cookies().set(COOKIE, JSON.stringify(sess), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60*60*24*30 });
}
export function getSession(): Sess | null {
  const c = cookies().get(COOKIE)?.value; if (!c) return null;
  try { return JSON.parse(c); } catch { return null; }
}
export function clearSession() { cookies().delete(COOKIE); }
