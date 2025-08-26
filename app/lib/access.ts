import 'server-only';
import { sql } from '@/app/lib/db';
import { ensureTables } from '@/app/lib/bootstrap';

export async function userHasPurchase(userId: string, product: string): Promise<boolean> {
  await ensureTables();
  const rows = (await sql`
    SELECT 1 as ok FROM purchases WHERE user_id=${userId} AND product=${product} LIMIT 1;
  `) as { ok: number }[];
  return rows.length > 0;
}
