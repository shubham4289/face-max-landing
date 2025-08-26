export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sql } from '@/app/lib/db';
import { ensureTables } from '@/app/lib/bootstrap';
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
      return NextResponse.json(
        { ok: false, error: 'MISSING_WEBHOOK_SECRET' },
        { status: 500 }
      );
    }
    const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
    const valid =
      sig &&
      expected.length === sig.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
    if (!valid) {
      console.warn(`[webhook ${reqId}] invalid signature`);
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const evt = JSON.parse(raw);
    if (evt.event !== 'payment.captured') {
      return NextResponse.json({ ok: true });
    }

    await ensureTables;

    const entity = evt.payload?.payment?.entity || {};
    const email = (entity.email || entity.notes?.email || entity.contact || '').toLowerCase();
    if (!email) {
      console.error(`[webhook ${reqId}] missing email`);
      return NextResponse.json({ ok: true });
    }
    const name = entity.notes?.name || entity.contact_name || null;
    const phone = entity.contact || entity.notes?.phone || null;
    const amount = entity.amount || 0;
    const currency = entity.currency || 'INR';
    const paymentId = entity.id || '';
    const orderId = entity.order_id || null;

    const user = await upsertUserByEmail({ email, name, phone });
    const userId = user.id;

    const payRows = (await sql`
      INSERT INTO payments(user_id, provider, provider_payment_id, status, amount_cents, currency, raw)
      VALUES(${userId}, 'razorpay', ${paymentId}, 'captured', ${amount}, ${currency}, ${JSON.stringify(evt)})
      ON CONFLICT (provider, provider_payment_id) DO NOTHING
      RETURNING id;
    `) as { id: string }[];
    if (payRows.length === 0) {
      console.info(`[webhook ${reqId}] payment already processed`);
      return NextResponse.json({ ok: true });
    }

    await sql`
      INSERT INTO purchases(user_id, product, amount_cents, currency, provider, provider_order_id)
      VALUES(${userId}, ${COURSE_ID}, ${amount}, ${currency}, 'razorpay', ${orderId})
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

    console.info(`[webhook ${reqId}] processed ${paymentId}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[webhook ${reqId}] error`, err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

