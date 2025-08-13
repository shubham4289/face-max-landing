import { NextRequest, NextResponse } from "next/server";

// GET /api/convert?from=INR&to=USD&amount=24999
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = (searchParams.get("from") || "INR").toUpperCase();
  const to = (searchParams.get("to") || "USD").toUpperCase();
  const amount = Number(searchParams.get("amount") || "0");

  if (!amount || isNaN(amount)) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  try {
    // Free rates source; cached ~30 min to reduce calls
    const ratesRes = await fetch(
      `https://api.exchangerate.host/latest?base=${from}&symbols=${to}`,
      { next: { revalidate: 1800 } } // 30 min
    );
    if (!ratesRes.ok) {
      const text = await ratesRes.text();
      return NextResponse.json({ error: "Rates error", detail: text }, { status: 502 });
    }
    const json = await ratesRes.json();
    const rate = json?.rates?.[to];

    if (!rate) {
      return NextResponse.json({ error: "No rate returned" }, { status: 502 });
    }

    const value = amount * rate;

    return NextResponse.json({ from, to, amount, rate, value });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Conversion failed" }, { status: 500 });
  }
}
