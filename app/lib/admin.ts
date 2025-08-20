import 'server-only';
import { getSession } from '@/app/lib/cookies';

/** Returns true if the current session email matches ADMIN_EMAIL (case-insensitive). */
export function isAdmin(): boolean {
  const admin = (process.env.ADMIN_EMAIL ?? '').toLowerCase().trim();
  if (!admin) return false;
  const s = getSession();
  return !!s?.email && s.email.toLowerCase() === admin;
}

/** Throws 'UNAUTHORIZED' if current session is not admin. */
export function assertAdmin() {
  if (!isAdmin()) throw new Error('UNAUTHORIZED');
}

/** SHIM for older code that still imports this name. */
export function requireAdminEmail() {
  assertAdmin();
}
