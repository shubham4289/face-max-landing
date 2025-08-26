export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

// Toggle currency here if account switches to INR
const CURRENCY: 'USD' | 'INR' = 'USD';
const AMOUNT = 299 * 100; // amount in smallest currency unit

const RATE_LIMIT_MAX = 5; // requests per IP per minute
const rateMap = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function getIp(req: Request) {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
}

export async function POST(req: Request) {
  const ip = getIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: 'RATE_LIMIT' }, { status: 429 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_INPUT' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const name =
    typeof body.name === 'string' ? body.name.trim().slice(0, 64) : undefined;
  const currency = CURRENCY;
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!email || !emailRegex.test(email)) {
    return NextResponse.json({ ok: false, error: 'INVALID_INPUT' }, { status: 400 });
  }

  try {
    console.info('[create-order] starting');
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const pubKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const appUrl = process.env.APP_URL;
    if (!keyId || !keySecret || !pubKey || !appUrl || keyId !== pubKey) {
      console.error('[create-order] env missing or mismatch');
      return NextResponse.json(
        { ok: false, error: 'ORDER_CREATE_FAILED' },
        { status: 500 }
      );
    }

    const amount = AMOUNT;
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const resp = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt: 'order_' + Date.now(),
        notes: { email, name },
      }),
    });

    if (!resp.ok) {
      console.error('[create-order] failed', await resp.text());
      return NextResponse.json(
        { ok: false, error: 'ORDER_CREATE_FAILED' },
        { status: 500 }
      );
    }

    const data = await resp.json();
    console.info('[create-order] success', { orderId: data.id });
    return NextResponse.json({
      ok: true,
      orderId: data.id,
      amount,
      currency,
    });
  } catch (err) {
    console.error('[create-order]', err);
    return NextResponse.json(
      { ok: false, error: 'ORDER_CREATE_FAILED' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
