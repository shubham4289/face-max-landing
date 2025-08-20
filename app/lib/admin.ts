// app/lib/admin.ts
import 'server-only';                 // <-- prevents bundling on the client
import { getSession } from '@/app/lib/cookies';

// Use a pure checker so pages/APIs can decide how to respond.
export function isAdmin(): boolean {
  const admin = (process.env.ADMIN_EMAIL ?? '').toLowerCase().trim();
  if (!admin) return false;

  const s = getSession();             // uses next/headers cookies() - server only
  return !!s?.email && s.email.toLowerCase() === admin;
}

// Optional convenience guard for APIs (call inside try/catch).
export function assertAdmin() {
  if (!isAdmin()) {
    throw new Error('UNAUTHORIZED');  // API routes should catch and return 401
  }
}
// --- keep the updated helpers ---
import 'server-only';
import { getSession } from '@/app/lib/cookies';

export function isAdmin(): boolean {
  const admin = (process.env.ADMIN_EMAIL ?? '').toLowerCase().trim();
  if (!admin) return false;
  const s = getSession();
  return !!s?.email && s.email.toLowerCase() === admin;
}

export function assertAdmin() {
  if (!isAdmin()) throw new Error('UNAUTHORIZED');
}

// --- SHIM for existing imports elsewhere ---
export function requireAdminEmail() {
  // Preserve previous behavior so existing imports keep working.
  assertAdmin();
}
