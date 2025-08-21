// app/lib/admin.ts
import { getSession } from "@/app/lib/cookies";

/** New canonical guard */
export function requireAdminEmail() {
  const admin = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  if (!admin) {
    throw new Error("ADMIN_EMAIL not configured");
  }
  const s = getSession();
  const current = (s?.email || "").toLowerCase().trim();
  if (!current || current !== admin) {
    const err: any = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
}

/** Back-compat: some files still import `assertAdmin` */
export const assertAdmin = requireAdminEmail;

/** Back-compat: some files still import `isAdmin` */
export function isAdmin(): boolean {
  const admin = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const s = getSession();
  const current = (s?.email || "").toLowerCase().trim();
  return !!admin && !!current && current === admin;
}
