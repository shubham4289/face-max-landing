import { cookies } from 'next/headers';

const COOKIE_NAME = 'fm_session';

export function setSession(session: { token: string; userId: string; name: string; email: string }) {
  cookies().set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

function parseCookie(header: string | null) {
  if (!header) return null;
  const parts = header.split(';').map((c) => c.trim());
  const part = parts.find((p) => p.startsWith(`${COOKIE_NAME}=`));
  if (!part) return null;
  return decodeURIComponent(part.slice(COOKIE_NAME.length + 1));
}

export function getSession(req?: Request) {
  try {
    const value = req ? parseCookie(req.headers.get('cookie')) : cookies().get(COOKIE_NAME)?.value;
    if (!value) return null;
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function clearSession() {
  cookies().set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
