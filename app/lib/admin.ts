// app/lib/admin.ts
import { cookies } from "next/headers";

/**
 * Very small admin check:
 *   - We stored session in a cookie earlier (userId/name/email).
 *   - Compare cookie "email" (or whatever you store) to ADMIN_EMAIL env.
 */
export function requireAdminEmail() {
  const admin = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const c = cookies();
  const email = c.get("email")?.value?.toLowerCase();
  if (!admin || !email || email !== admin) {
    throw new Error("Unauthorized");
  }
}
