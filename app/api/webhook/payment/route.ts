export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sql } from '@/app/lib/db';
import { ensureTables } from '@/app/lib/bootstrap';
import { randomId, issuePasswordToken } from '@/app/lib/crypto';
import { sendMail } from '@/app/lib/email';
import { COURSE_ID } from '@/app/lib/course-ids';

let schemaChecked = false;
async function checkSchema() {
  if (schemaChecked) return;
  schemaChecked = true;
  try {
    await sql`SELECT id, email, name FROM users LIMIT 1;`;
  } catch (err) {
    console.error('[webhook] users schema mismatch', err);
  }
}

export async function POST(req: Request) {
  console.info('[webhook] received');
  const raw = await req.text();
  const sig = req.headers.get('x-razorpay-signature') ?? '';
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  const expected = crypto.createHmac('sha256', secret).update(raw, 'utf8').digest('hex');
  let valid = false;
  if (sig.length === expected.length) {
    valid = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  }
  if (!valid) {
    console.warn('[webhook] invalid signature');
    return NextResponse.json(
      { ok: false, error: 'INVALID_SIGNATURE' },
      { status: 400 }
    );
  }

  let evt: any;
  try {
    evt = JSON.parse(raw);
  } catch (err) {
    console.error('[webhook] parse failed', err);
    return NextResponse.json({ ok: true });
  }

  console.info('[webhook] signature ok', { event: evt.event });
  if (evt.event !== 'payment.captured') {
    return NextResponse.json({ ok: true });
  }

  await ensureTables();
  await checkSchema();

  const entity = evt.payload?.payment?.entity ?? {};
  const email = (entity.email || entity.notes?.email || '').toLowerCase();
  if (!email) {
    return NextResponse.json({ ok: true, note: 'no email' });
  }
  const name = entity.notes?.name || entity.contact_name || '';
  const paymentId = entity.id;
  const amount = entity.amount;
  const currency = entity.currency;

  let userId: string | undefined;
  try {
    const rows = (await sql`
      INSERT INTO users (id, email, name, purchased)
      VALUES (${randomId()}, ${email}, ${name}, true)
      ON CONFLICT (email) DO UPDATE
      SET name = COALESCE(EXCLUDED.name, users.name),
          purchased = true
      RETURNING id;
    `) as { id: string }[] | undefined;
    userId = Array.isArray(rows) ? rows[0]?.id : undefined;
    console.info('[webhook] user upsert', { userId });
  } catch (err) {
    console.error('[webhook] write failed', err);
  }

  let newPurchase = false;
  if (userId) {
    try {
      const res = (await sql`
        INSERT INTO purchases(user_id, course_id, payment_id)
        VALUES(${userId}, ${COURSE_ID}, ${paymentId})
        ON CONFLICT (payment_id) DO NOTHING
        RETURNING 1;
      `) as unknown[] | undefined;
      newPurchase = Array.isArray(res) && res.length > 0;
    } catch (err) {
      console.error('[webhook] write failed', err);
    }
  }

  try {
    await sql`
      INSERT INTO payments(id, provider, email, amount, currency, payload)
      VALUES(${paymentId}, 'razorpay', ${email}, ${amount}, ${currency}, ${evt})
      ON CONFLICT DO NOTHING;
    `;
  } catch (err) {
    console.error('[webhook] write failed', err);
  }

  if (newPurchase) {
    try {
      const token = await issuePasswordToken(email, 'set', 120);
      const appUrl = process.env.APP_URL || 'https://thefacemax.com';
      const link = `${appUrl}/auth/set-password?token=${token}`;
      await sendMail(
        email,
        'Welcome to The Ultimate Implant Course',
        `<p>Welcome to The Ultimate Implant Course.</p><p><a href="${link}">Click here to set your password</a>. This link is valid for 2 hours.</p>`
      );
      console.info('[webhook] email sent', { email });
    } catch (err) {
      console.error('[webhook] email failed', err);
    }
  }

  console.info('[webhook] processed', { payment_id: paymentId });
  return NextResponse.json({ ok: true }, { status: 200 });
}
