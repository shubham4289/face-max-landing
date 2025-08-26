import 'server-only';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requireAdminEmail } from '@/app/lib/admin';
import { ensureTables } from '@/app/lib/bootstrap';
import { sql } from '@/app/lib/db';
import { randomId, hashToken, hashPassword } from '@/app/lib/crypto';
import { sendEmail } from '@/app/lib/email';
import { COURSE_ID } from '@/app/lib/course-ids';
import { setPasswordEmail } from '@/app/emails/set-password';

export async function POST(req: Request) {
  try {
    requireAdminEmail();
    await ensureTables;

    const body = await req.json().catch(() => ({} as any));
    const email = (body.email ?? '').toString().trim().toLowerCase();
    const name = (body.name ?? '').toString().trim();

    if (!email) {
      return NextResponse.json({ ok: false, error: 'Email required' }, { status: 400 });
    }

    const existing = (await sql`SELECT id, name FROM users WHERE email=${email} LIMIT 1;`) as { id: string; name: string }[];
    let userId: string;
    if (existing.length === 0) {
      const userName = name || email;
      const fakeHash = await hashPassword(randomId());
      const rows = (await sql`
        INSERT INTO users(email, name, password_hash)
        VALUES(${email}, ${userName}, ${fakeHash})
        RETURNING id;
      `) as { id: string }[];
      userId = rows[0].id;
    } else {
      userId = existing[0].id;
      if (name && name !== existing[0].name) {
        await sql`UPDATE users SET name=${name} WHERE id=${userId};`;
      }
    }

    await sql`
      INSERT INTO purchases(user_id, product, amount_cents, currency)
      VALUES(${userId}, ${COURSE_ID}, 0, 'INR')
      ON CONFLICT DO NOTHING;
    `;

    const token = randomId();
    const tokenHash = hashToken(token);
    await sql`INSERT INTO password_resets(id, user_id, token_hash, expires_at) VALUES(${randomId()}, ${userId}, ${tokenHash}, now() + interval '45 minutes');`;

    const link = `https://thefacemax.com/auth/set-password?token=${token}`;
    await sendEmail(email, 'Set your password for The Face Max', setPasswordEmail(link));

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[admin/invite] failed:', err);
    const status = err.status || 500;
    return NextResponse.json({ ok: false, error: err.message || 'Server error' }, { status });
  }
}
