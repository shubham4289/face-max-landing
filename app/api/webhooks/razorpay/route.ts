export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sql } from '@/app/lib/db';
import { ensureTables } from '@/app/lib/bootstrap';
import { randomId, hashToken, hashPassword } from '@/app/lib/crypto';
import { sendEmail } from '@/app/lib/email';
import { COURSE_ID } from '@/app/lib/course-ids';
import { setPasswordEmail } from '@/app/emails/set-password';

const RATE_LIMIT_MAX = 60;
let rateCount = 0;
let rateReset = Date.now();

function rateLimited() {
  const now = Date.now();
  if (now > rateReset) {
    rateReset = now + 60_000;
    rateCount = 0;
  }
  rateCount++;
  return rateCount > RATE_LIMIT_MAX;
}

export async function POST(req: Request) {
  if (rateLimited()) {
    console.error('razorpay webhook rate limited');
    return NextResponse.json({ ok: false }, { status: 202 });
  }

  try {
    const raw = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const expected = crypto
      .createHmac('sha256', secret)
      .update(raw)
      .digest('hex');
    if (
      !signature ||
      !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    ) {
      return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(raw);
    if (!['payment.captured', 'order.paid'].includes(event.event)) {
      return NextResponse.json({ ok: true });
    }

    const payment = event.payload?.payment?.entity || {};
    const order = event.payload?.order?.entity || {};
    const email = payment.email || order.email;
    const name =
      payment.notes?.name || payment.card?.name || order.notes?.name || '';
    if (!email) return NextResponse.json({ ok: true });

    await ensureTables;
    const emailLower = email.toLowerCase();
    const existing = (await sql`SELECT id, name FROM users WHERE email=${emailLower} LIMIT 1;`) as {
      id: string;
      name: string;
    }[];
    let userId: string;
    let userName: string;
    if (existing.length === 0) {
      userName = name || emailLower;
      const fakeHash = await hashPassword(randomId());
      const rows = (await sql`
        INSERT INTO users(email, name, password_hash)
        VALUES(${emailLower}, ${userName}, ${fakeHash})
        RETURNING id;
      `) as { id: string }[];
      userId = rows[0].id;
    } else {
      userId = existing[0].id;
      userName = existing[0].name;
    }

    await sql`
      INSERT INTO purchases(user_id, product, amount_cents, currency)
      VALUES(${userId}, ${COURSE_ID}, ${payment.amount || 0}, ${payment.currency || 'INR'})
      ON CONFLICT DO NOTHING;
    `;

    const token = randomId();
    const tokenHash = hashToken(token);
    await sql`INSERT INTO password_resets(id, user_id, token_hash, expires_at) VALUES(${randomId()}, ${userId}, ${tokenHash}, now() + interval '45 minutes');`;

    const link = `https://thefacemax.com/auth/set-password?token=${token}`;
    await sendEmail(
      emailLower,
      'Set your password for The Face Max',
      setPasswordEmail(link)
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
