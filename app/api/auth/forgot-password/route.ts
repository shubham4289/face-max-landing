export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { ensureTables } from '@/app/lib/bootstrap';
import { issuePasswordToken } from '@/app/lib/crypto';
import { sendMail } from '@/app/lib/email';

export async function POST(req: Request) {
  try {
    await ensureTables();
    const { email } = await req.json().catch(() => ({}) as any);
    const emailLower = (email ?? '').toString().trim().toLowerCase();
    if (!emailLower) {
      return NextResponse.json({ ok: true });
    }

    const rows = (await sql`
      SELECT 1 as ok FROM purchases p
      JOIN users u ON u.id = p.user_id
      WHERE u.email=${emailLower}
      LIMIT 1;
    `) as { ok: number }[];
    if (rows.length === 1) {
      const token = await issuePasswordToken(emailLower, 'reset', 60);
      const appUrl = process.env.APP_URL || 'https://thefacemax.com';
      const link = `${appUrl}/auth/set-password?token=${token}`;
      await sendMail(
        emailLower,
        'Reset your password – The Ultimate Implant Course',
        `<p><a href="${link}">Click here to reset your password</a>. This link is valid for 1 hour.</p>`
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: true });
  }
}
