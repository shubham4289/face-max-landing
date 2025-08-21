import 'server-only';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { ensureTables } from '@/app/lib/bootstrap';
import { randomId, hashToken } from '@/app/lib/crypto';
import { sendEmail } from '@/app/lib/email';
import { setPasswordEmail } from '@/app/emails/set-password';
import { userHasPurchase } from '@/app/lib/access';
import { COURSE_ID } from '@/app/lib/course-ids';

const LIMIT_PER_DAY = 5;

export async function POST(req: Request) {
  try {
    await ensureTables();
    const body = await req.json().catch(() => ({} as any));
    const email = (body.email ?? '').toString().trim().toLowerCase();
    if (email) {
      const users = (await sql`SELECT id FROM users WHERE email=${email} LIMIT 1;`) as { id: string }[];
      if (users.length === 1) {
        const userId = users[0].id;
        const countRows = (await sql`
          SELECT count(*)::int AS count
          FROM password_resets
          WHERE user_id=${userId} AND created_at > now() - interval '24 hours';
        `) as { count: number }[];
        const hasPurchase = await userHasPurchase(userId, COURSE_ID);
        if (hasPurchase && (countRows[0]?.count ?? 0) < LIMIT_PER_DAY) {
          const token = randomId();
          const tokenHash = hashToken(token);
          await sql`INSERT INTO password_resets(id, user_id, token_hash, expires_at) VALUES(${randomId()}, ${userId}, ${tokenHash}, now() + interval '45 minutes');`;
          const link = `https://thefacemax.com/auth/set-password?token=${token}`;
          await sendEmail(email, 'Reset your password', setPasswordEmail(link));
        }
      }
    }
  } catch (err) {
    console.error('[auth/forgot] failed:', err);
  }
  return NextResponse.json({ message: "If the account exists, we've sent instructions." });
}
