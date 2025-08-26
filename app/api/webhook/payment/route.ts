export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sql } from '@/app/lib/db';
import { ensureTables } from '@/app/lib/bootstrap';
import { randomId, issuePasswordToken } from '@/app/lib/crypto';
import { sendMail } from '@/app/lib/email';

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
    if (!signature || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
      return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(raw);
    if (event.event !== 'payment.captured') {
      return NextResponse.json({ ok: true });
    }

    const payment = event.payload?.payment?.entity || {};
    const paymentId = payment.id;
    const email = payment.email || payment.notes?.email;
    const amount = payment.amount;
    const currency = payment.currency;

    if (!email) {
      console.error('razorpay webhook missing email');
      return NextResponse.json({ ok: true });
    }
    if (!paymentId || !amount || !currency) {
      console.error('razorpay webhook missing fields');
      return NextResponse.json({ ok: true });
    }

    await ensureTables();
    const emailLower = email.toLowerCase();

    await sql`INSERT INTO users(id, email, purchased) VALUES(${randomId()}, ${emailLower}, true)
      ON CONFLICT (email) DO UPDATE SET purchased=true;`;

    await sql`INSERT INTO payments(id, provider, email, amount, currency, payload) VALUES(${paymentId}, 'razorpay', ${emailLower}, ${amount}, ${currency}, ${event})
      ON CONFLICT DO NOTHING;`;

    const token = await issuePasswordToken(emailLower, 'set', 120);
    const appUrl = process.env.APP_URL || 'https://thefacemax.com';
    const link = `${appUrl}/auth/set-password?token=${token}`;
    await sendMail(
      emailLower,
      'Set your password – The Ultimate Implant Course',
      `<p><a href="${link}">Click here to set your password</a>. This link is valid for 2 hours.</p>`
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
