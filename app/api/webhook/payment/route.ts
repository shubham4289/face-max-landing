export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sql } from '@/app/lib/db';
import { issuePasswordToken } from '@/app/lib/crypto';
import { sendMail } from '@/app/lib/email';
import { COURSE_ID } from '@/app/lib/course-ids';
import { upsertUserByEmail } from '@/app/lib/users';

export async function POST(req: Request) {
  const reqId = crypto.randomUUID();
  try {
    const raw = await req.text();
    const sig = req.headers.get('x-razorpay-signature') || '';
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error(`[webhook ${reqId}] missing secret`);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
    const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
    const valid =
      sig &&
      expected.length === sig.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
    if (!valid) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const evt = JSON.parse(raw);
    if (evt.event !== 'payment.captured') {
      return NextResponse.json({ ok: true });
    }

    const entity = evt.payload?.payment?.entity || {};
    const email = (entity.email || entity.notes?.email || entity.contact || '').toLowerCase();
    if (!email) {
      console.error(`[webhook ${reqId}] missing email`);
      return NextResponse.json({ ok: true });
    }
    const name = entity.notes?.name || entity.contact_name || null;
    const phone = entity.contact || entity.notes?.phone || null;
    const amountCents = entity.amount || 0;
    const currency = entity.currency || 'INR';
    const paymentId = entity.id || '';

    const user = await upsertUserByEmail({ email, name, phone });
    const userId = user.id;

    const payRows = (await sql`
      INSERT INTO payments (provider, provider_payment_id, status, user_id, amount_cents, currency, raw)
      VALUES ('razorpay', ${paymentId}, 'captured', ${userId}, ${amountCents}, ${currency}, ${JSON.stringify(evt)})
      ON CONFLICT (provider_payment_id) DO NOTHING
      RETURNING id;
    `) as { id: string }[];

    if (payRows.length === 0) {
      return NextResponse.json({ ok: true });
    }

    await sql`
      INSERT INTO purchases (user_id, product, amount_cents, currency, provider)
      VALUES (${userId}, ${COURSE_ID}, ${amountCents}, ${currency}, 'razorpay')
      ON CONFLICT (user_id, product) DO NOTHING;
    `;

    const token = await issuePasswordToken(user.email, 'set', 120);
    const appUrl = process.env.APP_URL || 'https://thefacemax.com';
    const link = `${appUrl}/auth/set-password?token=${token}`;
    await sendMail(
      user.email,
      'Welcome to The Ultimate Implant Course',
      `<p>Welcome to The Ultimate Implant Course.</p><p><a href="${link}">Click here to set your password</a>. This link is valid for 2 hours.</p>`
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[webhook ${reqId}]`, err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

