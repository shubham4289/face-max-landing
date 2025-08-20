// app/lib/auth.ts
export function isAdmin(email?: string | null) {
  const list = (process.env.ADMIN_EMAILS || "admin@thefacemax.com")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return !!email && list.includes(email.toLowerCase());
}
