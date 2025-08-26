export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sql } from '@/app/lib/db';
import { ensureTables } from '@/app/lib/bootstrap';
import {
  randomId,
  issuePasswordToken,
} from '@/app/lib/crypto';
import { sendMail } from '@/app/lib/email';
import { COURSE_ID } from '@/app/lib/course-ids';

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature') || '';
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody, 'utf8')
    .digest('hex');
  let valid = false;
  if (signature.length === expected.length) {
    valid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  }
  if (!valid) {
    console.warn('razorpay webhook invalid signature');
    return NextResponse.json(
      { ok: false, error: 'invalid signature' },
      { status: 400 }
    );
  }

  try {
    const event = JSON.parse(rawBody);
    if (event.event !== 'payment.captured') {
      return NextResponse.json({ ok: true });
    }

    const pmt = event.payload?.payment?.entity ?? {};
    const ord = event.payload?.order?.entity ?? {};
    const email = (
      pmt.email ||
      ord.email ||
      event.payload?.customer?.email ||
      ''
    ).toLowerCase();
    if (!email) {
      return NextResponse.json(
        { ok: false, error: 'No email in event' },
        { status: 400 }
      );
    }
    const rawName =
      pmt.notes?.name ||
      ord.notes?.name ||
      event.payload?.customer?.name ||
      (email ? email.split('@')[0] : '');
    const name = (rawName && String(rawName).trim()) || 'Student';
    const phone = pmt.contact || ord.contact || event.payload?.customer?.contact || null;

    const paymentId = pmt.id;
    const amount = pmt.amount;
    const currency = pmt.currency;
    if (!paymentId || !amount || !currency) {
      console.error('razorpay webhook missing fields');
      return NextResponse.json({ ok: true });
    }

    await ensureTables();

    const rows = (await sql`
      INSERT INTO users (id, email, name, phone, purchased)
      VALUES (${randomId()}, ${email}, ${name}, ${phone}, true)
      ON CONFLICT (email) DO UPDATE
      SET name  = COALESCE(EXCLUDED.name, users.name),
          phone = COALESCE(EXCLUDED.phone, users.phone),
          purchased = true
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
      VALUES(${paymentId}, 'razorpay', ${email}, ${amount}, ${currency}, ${event})
      ON CONFLICT DO NOTHING;
    `;

    const token = await issuePasswordToken(email, 'set', 120);
    const appUrl = process.env.APP_URL || 'https://thefacemax.com';
    const link = `${appUrl}/auth/set-password?token=${token}`;
    await sendMail(
      email,
      'Set your password – The Ultimate Implant Course',
      `<p><a href="${link}">Click here to set your password</a>. This link is valid for 2 hours.</p>`
    );
  } catch (err) {
    console.error(err);
  }

  return NextResponse.json({ ok: true });
}
