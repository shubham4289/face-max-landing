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

function verifyStripeSignature(raw: string, sig: string | null, secret: string) {
  if (!sig) return false;
  const parts = sig.split(',').reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split('=');
    if (k && v) acc[k] = v;
    return acc;
  }, {});
  const timestamp = parts['t'];
  const v1 = parts['v1'];
  if (!timestamp || !v1) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${raw}`)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
}

export async function POST(req: Request) {
  if (rateLimited()) {
    console.error('stripe webhook rate limited');
    return NextResponse.json({ ok: false }, { status: 202 });
  }

  try {
    const raw = await req.text();
    const sig = req.headers.get('stripe-signature');
    const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
    if (!verifyStripeSignature(raw, sig, secret)) {
      return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(raw);
    if (
      ![
        'checkout.session.completed',
        'payment_intent.succeeded',
        'invoice.paid',
      ].includes(event.type)
    ) {
      return NextResponse.json({ ok: true });
    }

    const obj = event.data?.object || {};
    const email =
      obj.customer_details?.email ||
      obj.receipt_email ||
      obj.email;
    const name = obj.customer_details?.name || obj.customer_name || '';
    if (!email) return NextResponse.json({ ok: true });

    await ensureTables();
    const emailLower = email.toLowerCase();
    const existing = (await sql`SELECT id, name FROM users WHERE email=${emailLower} LIMIT 1;`) as {
      id: string;
      name: string;
    }[];
    let userId: string;
    let userName: string;
    if (existing.length === 0) {
      userId = randomId();
      userName = name || emailLower;
      const fakeHash = await hashPassword(randomId());
      await sql`INSERT INTO users(id, email, name, password_hash) VALUES(${userId}, ${emailLower}, ${userName}, ${fakeHash});`;
    } else {
      userId = existing[0].id;
      userName = existing[0].name;
    }

    await sql`INSERT INTO purchases(user_id, course_id) VALUES(${userId}, ${COURSE_ID}) ON CONFLICT DO NOTHING;`;

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
