export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sql } from '@/app/lib/db';
import { ensureTables } from '@/app/lib/bootstrap';
import {
  randomId,
  issuePasswordToken,
  safeEqualHex,
} from '@/app/lib/crypto';
import { sendMail } from '@/app/lib/email';
import { COURSE_ID } from '@/app/lib/course-ids';

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get('x-razorpay-signature') || '';
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  if (!signature || !safeEqualHex(expected, signature)) {
    console.error('razorpay webhook invalid signature');
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
  }

  try {
    const event = JSON.parse(raw);
    if (event.event !== 'payment.captured') {
      return NextResponse.json({ ok: true });
    }

    const payment = event.payload?.payment?.entity;
    const email = payment?.email || payment?.notes?.email;
    const paymentId = payment?.id;
    const amount = payment?.amount;
    const currency = payment?.currency;
    if (!email || !paymentId || !amount || !currency) {
      console.error('razorpay webhook missing fields');
      return NextResponse.json({ ok: true });
    }

    await ensureTables();
    const emailLower = email.toLowerCase();

    const rows = (await sql`
      INSERT INTO users(id, email, purchased)
      VALUES(${randomId()}, ${emailLower}, true)
      ON CONFLICT (email) DO UPDATE SET purchased=true
      RETURNING id;
    `) as { id: string }[];
    const userId = rows[0]?.id;

    if (userId) {
      await sql`
        INSERT INTO purchases(user_id, course_id)
        VALUES(${userId}, ${COURSE_ID})
        ON CONFLICT DO NOTHING;
      `;
    }

    await sql`
      INSERT INTO payments(id, provider, email, amount, currency, payload)
      VALUES(${paymentId}, 'razorpay', ${emailLower}, ${amount}, ${currency}, ${event})
      ON CONFLICT DO NOTHING;
    `;

    const token = await issuePasswordToken(emailLower, 'set', 120);
    const appUrl = process.env.APP_URL || 'https://thefacemax.com';
    const link = `${appUrl}/auth/set-password?token=${token}`;
    await sendMail(
      emailLower,
      'Set your password – The Ultimate Implant Course',
      `<p><a href="${link}">Click here to set your password</a>. This link is valid for 2 hours.</p>`
    );
  } catch (err) {
    console.error(err);
  }

  return NextResponse.json({ ok: true });
}
