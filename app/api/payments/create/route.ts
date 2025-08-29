export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

const CURRENCY: 'USD' | 'INR' = 'INR';
const AMOUNT = 299 * 100;

const KEY_ID = process.env.RAZORPAY_KEY_ID!;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;

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
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 64) : undefined;
  const currency = CURRENCY;
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!email || !emailRegex.test(email)) {
    return NextResponse.json({ ok: false, error: 'INVALID_INPUT' }, { status: 400 });
  }

  try {
    const amount = AMOUNT;
    const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');
    const notes: Record<string, string> = { email };
    if (name) notes.name = name;
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
        notes,
      }),
    });

    if (!resp.ok) {
      console.error('[create-order]', await resp.text());
      return NextResponse.json({ ok: false, error: 'ORDER_CREATE_FAILED' }, { status: 500 });
    }

    const data = await resp.json();
    return NextResponse.json({
      ok: true,
      orderId: data.id,
      amount,
      currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
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

