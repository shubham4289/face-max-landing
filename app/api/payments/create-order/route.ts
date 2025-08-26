export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

// Amounts are in the smallest currency unit
const USD_AMOUNT = 299 * 100; // $299.00 in cents
const INR_AMOUNT = 24999; // ₹24,999

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
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 64) : undefined;
  const currency = body.currency === 'INR' ? 'INR' : 'USD';
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!email || !emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  if (!keyId || !keySecret) {
    console.error('razorpay keys missing');
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }

  const amount = currency === 'INR' ? INR_AMOUNT : USD_AMOUNT;

  try {
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
        notes: { email, name },
      }),
    });

    if (!resp.ok) {
      console.error('razorpay order create failed', await resp.text());
      return NextResponse.json({ error: 'Payment error' }, { status: 500 });
    }

    const data = await resp.json();
    return NextResponse.json({
      orderId: data.id,
      amount,
      currency,
      keyId,
    });
  } catch (e) {
    console.error('razorpay order exception', e);
    return NextResponse.json({ error: 'Payment error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
