import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { ensureTables } from '@/app/lib/bootstrap';
import { randomId, hashToken } from '@/app/lib/crypto';
import { expiresIn } from '@/app/lib/otp';
import { sendEmail } from '@/app/lib/email';
import { passwordSetEmail } from '@/app/emails/set-password';
import { COURSE_ID } from '@/app/lib/course-ids';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WINDOW_MS = 60_000;
const LIMIT = 60;
let hits = 0;
let reset = Date.now();
function rateLimited() {
  const now = Date.now();
  if (now > reset) { hits = 0; reset = now + WINDOW_MS; }
  hits++;
  return hits > LIMIT;
}

export async function POST(req: Request) {
  if (rateLimited()) {
    console.error('razorpay webhook rate limited');
    return NextResponse.json({ ok: true }, { status: 202 });
  }
  try {
    await ensureTables();
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!signature || !secret) {
      console.error('razorpay missing signature');
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    if (expected !== signature) {
      console.error('razorpay invalid signature');
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const event = JSON.parse(body);
    if (event.event !== 'payment.captured') {
      return NextResponse.json({ ok: true });
    }
    const payment = event.payload?.payment?.entity || {};
    const email: string | undefined = payment.email;
    let name: string | undefined = payment.notes?.name || payment.contact;
    if (!email) {
      return NextResponse.json({ ok: true });
    }
    const lower = email.toLowerCase();
    const userRows = await sql`SELECT id, name FROM users WHERE email=${lower} LIMIT 1;` as { id: string; name: string }[];
    let userId: string;
    if (userRows.length === 0) {
      userId = randomId();
      name = name || lower.split('@')[0];
      await sql`INSERT INTO users(id, email, name, password_hash) VALUES(${userId}, ${lower}, ${name}, '')`;
    } else {
      userId = userRows[0].id;
      name = userRows[0].name;
    }

    await sql`INSERT INTO purchases(user_id, course_id) VALUES(${userId}, ${COURSE_ID}) ON CONFLICT DO NOTHING;`;

    const token = randomId();
    await sql`INSERT INTO password_resets(id, user_id, token_hash, expires_at) VALUES(${randomId()}, ${userId}, ${hashToken(token)}, ${expiresIn(45)});`;

    await sendEmail(lower, 'Set your Face Max password', passwordSetEmail(name || '', token));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('razorpay webhook error', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
