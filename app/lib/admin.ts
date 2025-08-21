// app/lib/admin.ts
import { getSession } from "@/app/lib/cookies";

/**
 * Throws if the current session email != ADMIN_EMAIL
 * Use inside server components or API routes (Node runtime).
 */
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
