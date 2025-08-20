// app/lib/admin.ts
import { getSession } from "@/app/lib/cookies";

export function assertAdmin() {
  const admin = process.env.ADMIN_EMAIL?.toLowerCase().trim() ?? "";
  const s = getSession();
  if (!s || !s.email || s.email.toLowerCase() !== admin) {
    throw new Error("Unauthorized");
  }
}
