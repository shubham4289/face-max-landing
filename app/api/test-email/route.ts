// app/api/test-email/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/app/lib/email';
import { randomId } from '@/app/lib/crypto';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const to = searchParams.get('to');
    if (!to) {
      return NextResponse.json({ ok: false, error: "missing ?to=" }, { status: 400 });
    }

    const token = randomId(32);
    const r = await sendWelcomeEmail({ to, name: null, token });
    return NextResponse.json({ ok: true, result: r });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e.message ?? 'send failed' }, { status: 500 });
  }
}
