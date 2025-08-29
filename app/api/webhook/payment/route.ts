export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sql } from '@/app/lib/db';
import { COURSE_ID } from '@/app/lib/course-ids';
import { sendWelcomeEmail } from '@/app/lib/email';
import { issuePasswordToken } from '@/app/lib/crypto';

export async function POST(req: Request) {
  const reqId = crypto.randomUUID();
  try {
    const raw = await req.text();
    const sig = req.headers.get('x-razorpay-signature') || '';
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error(`[webhook ${reqId}] missing secret`);
      return new NextResponse('server error', { status: 500 });
    }
    const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
    const valid =
      sig &&
      expected.length === sig.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
    if (!valid) {
      return new NextResponse('invalid signature', { status: 400 });
    }

    const evt = JSON.parse(raw);
    if (evt.event !== 'payment.captured') {
      return new NextResponse('ok');
    }

    const entity = evt.payload?.payment?.entity || {};
    const paymentId: string = entity.id || '';
    const emailRaw: string | undefined =
      entity.email || entity.notes?.email || entity.contact;
    const email = emailRaw ? String(emailRaw).trim().toLowerCase() : '';
    const name: string | null =
      entity.notes?.name || entity.contact_name || null;
    const phone: string | null =
      entity.contact || entity.notes?.phone || null;
    const amount = typeof entity.amount === 'number' ? entity.amount : 0;
    const currency: string = entity.currency || 'INR';

    let userId: string | null = null;
    if (email) {
      const users = (await sql`
        SELECT id FROM users WHERE lower(email)=lower(${email}) LIMIT 1;
      `) as { id: string }[];
      if (users.length === 0) {
        const inserted = (await sql`
          INSERT INTO users(email, name, phone)
          VALUES(${email}, ${name}, ${phone})
          RETURNING id;
        `) as { id: string }[];
        userId = inserted[0].id;
      } else {
        userId = users[0].id;
        if (name || phone) {
          await sql`
            UPDATE users
            SET name = COALESCE(${name}, name),
                phone = COALESCE(${phone}, phone)
            WHERE id=${userId};
          `;
        }
      }
    }

    const existingPay = (await sql`
      SELECT id FROM payments WHERE provider_payment_id=${paymentId} LIMIT 1;
    `) as { id: string }[];
    if (existingPay.length === 0) {
      const id = crypto.randomUUID();
      await sql`
        INSERT INTO payments(id, provider, provider_payment_id, amount_cents, currency, status, raw, user_id)
        VALUES(${id}, 'razorpay', ${paymentId}, ${amount}, ${currency}, 'captured', ${JSON.stringify(evt)}, ${userId});
      `;
    }

    if (userId) {
      const existingPurchase = (await sql`
        SELECT id FROM purchases WHERE user_id=${userId} AND product=${COURSE_ID} LIMIT 1;
      `) as { id: string }[];
      if (existingPurchase.length === 0) {
        await sql`
          INSERT INTO purchases(user_id, product, amount_cents, currency, provider)
          VALUES(${userId}, ${COURSE_ID}, ${amount}, ${currency}, 'razorpay');
        `;
      }

      if (email) {
        let token: string;
        const tokenRows = (await sql`
          SELECT token FROM password_tokens
          WHERE email=${email} AND purpose='set' AND expires_at > now()
          ORDER BY expires_at DESC LIMIT 1;
        `) as { token: string }[];
        if (tokenRows.length > 0) {
          token = tokenRows[0].token;
        } else {
          token = await issuePasswordToken(email, 'set', 1440);
        }
        await sendWelcomeEmail({ to: email, name, token });
      }
    }

    return new NextResponse('ok');
  } catch (err) {
    console.error('[webhook', reqId, '] error', err);
    return new NextResponse('server error', { status: 500 });
  }
}
