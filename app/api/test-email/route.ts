// app/api/test-email/route.ts
import { NextResponse } from 'next/server';
import { sendEmail } from '../../lib/email';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const to = searchParams.get('to');
    if (!to) {
      return NextResponse.json({ ok: false, error: "missing ?to=" }, { status: 400 });
    }

    const r = await sendEmail(
      to,
      'The Face Max — test email ✅',
      `<p>Hello from the site. If you got this, Resend + domain setup works.</p>`
    );
    return NextResponse.json({ ok: true, result: r });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e.message ?? 'send failed' }, { status: 500 });
  }
}
