import { sql } from '@/app/lib/db';

export async function upsertUserByEmail({
  email,
  name,
  phone,
}: {
  email: string;
  name?: string | null;
  phone?: string | null;
}): Promise<{ id: string; email: string }> {
  const lower = email.toLowerCase();
  const rows = (await sql`
    INSERT INTO users(email, name, phone)
    VALUES(${lower}, ${name || null}, ${phone || null})
    ON CONFLICT (email) DO UPDATE
    SET name = COALESCE(EXCLUDED.name, users.name),
        phone = COALESCE(EXCLUDED.phone, users.phone)
    RETURNING id, email;
  `) as { id: string; email: string }[];
  return rows[0];
}
