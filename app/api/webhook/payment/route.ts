export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sql } from '@/app/lib/db';
import { ensureTables } from '@/app/lib/bootstrap';
import { randomId, issuePasswordToken } from '@/app/lib/crypto';
import { sendMail } from '@/app/lib/email';
import { COURSE_ID } from '@/app/lib/course-ids';

export async function POST(req: Request) {
  console.info('[webhook] received');
  const raw = await req.text();
  const sig = req.headers.get('x-razorpay-signature') ?? '';
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(raw, 'utf8')
    .digest('hex');
  let valid = false;
  if (sig.length === expected.length) {
    valid = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  }
  if (!valid) {
    console.warn('razorpay webhook invalid signature');
    return NextResponse.json(
      { ok: false, error: 'invalid signature' },
      { status: 400 }
    );
  }

  const evt = JSON.parse(raw);
  console.info('[webhook] verified', { event: evt.event });
  if (evt.event !== 'payment.captured') {
    return NextResponse.json({ ok: true });
  }

  const entity = evt.payload?.payment?.entity ?? {};
  const email = (entity.email || entity.notes?.email || '').toLowerCase();
  if (!email) {
    return NextResponse.json({ ok: true, note: 'no email' });
  }
  const name = entity.notes?.name || entity.contact_name || '';
  const phone = entity.contact || entity.notes?.phone || null;
  const paymentId = entity.id;
  const amount = entity.amount;
  const currency = entity.currency;

  try {
    await ensureTables();

    const rows = (await sql`
      INSERT INTO users (id, email, name, phone, purchased)
      VALUES (${randomId()}, ${email}, ${name}, ${phone}, true)
      ON CONFLICT (email) DO UPDATE
      SET name  = COALESCE(EXCLUDED.name, users.name),
          phone = COALESCE(EXCLUDED.phone, users.phone),
          purchased = true
      RETURNING id;
    `) as { id: string }[] | undefined;
    const userId = Array.isArray(rows) ? rows[0]?.id : undefined;

    let newPurchase = false;
    if (userId) {
      const res = (await sql`
        INSERT INTO purchases(user_id, course_id, payment_id)
        VALUES(${userId}, ${COURSE_ID}, ${paymentId})
        ON CONFLICT (payment_id) DO NOTHING
        RETURNING 1;
      `) as unknown[] | undefined;
      newPurchase = Array.isArray(res) && res.length > 0;
      if (!newPurchase) {
        console.info('[webhook] duplicate, skipping', { payment_id: paymentId });
      }
    }

    await sql`
      INSERT INTO payments(id, provider, email, amount, currency, payload)
      VALUES(${paymentId}, 'razorpay', ${email}, ${amount}, ${currency}, ${evt})
      ON CONFLICT DO NOTHING;
    `;

    if (newPurchase) {
      const token = await issuePasswordToken(email, 'set', 120);
      const appUrl = process.env.APP_URL || 'https://thefacemax.com';
      const link = `${appUrl}/auth/set-password?token=${token}`;
      await sendMail(
        email,
        'Set your password – The Ultimate Implant Course',
        `<p><a href="${link}">Click here to set your password</a>. This link is valid for 2 hours.</p>`
      );
    }
  } catch (err) {
    console.error('[webhook]', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  console.info('[webhook] processed', { payment_id: paymentId });
  return NextResponse.json({ ok: true }, { status: 200 });
}
