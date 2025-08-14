// app/api/geo-price/route.ts
import { NextResponse } from "next/server";

type AbstractResp = {
  ip_address?: string;
  country?: string;
  currency?: {
    currency_code?: string;   // e.g. "USD"
    currency_name?: string;
    currency_symbol?: string; // e.g. "$"
  };
};

// Simple INR->local currency rates (approx). Update occasionally.
const INR_RATES: Record<string, { rate: number; symbol: string }> = {
  USD: { rate: 0.012, symbol: "$" },
  EUR: { rate: 0.011, symbol: "€" },
  GBP: { rate: 0.0095, symbol: "£" },
  AUD: { rate: 0.018, symbol: "A$" },
  CAD: { rate: 0.016, symbol: "C$" },
  AED: { rate: 0.044, symbol: "د.إ" },
  SGD: { rate: 0.016, symbol: "S$" },
  JPY: { rate: 1.9, symbol: "¥" },
  INR: { rate: 1, symbol: "₹" }, // fallback
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const baseInrParam = searchParams.get("baseInr");
    const baseInr = Number(baseInrParam);
    if (!baseInrParam || !Number.isFinite(baseInr) || baseInr <= 0) {
      return NextResponse.json(
        { error: "Invalid or missing baseInr" },
        { status: 400 }
      );
    }

    // Works on Vercel: picks first IP in x-forwarded-for if present
    const fwd = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
    const ip = fwd || undefined;

    const key = process.env.ABSTRACT_API_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "Missing ABSTRACT_API_KEY" },
        { status: 500 }
      );
    }

    const url = new URL("https://ipgeolocation.abstractapi.com/v1/");
    url.searchParams.set("api_key", key);
    if (ip) url.searchParams.set("ip_address", ip);

    const resp = await fetch(url.toString(), { cache: "no-store" });
    if (!resp.ok) {
      return NextResponse.json(
        { error: "Abstract API error", status: resp.status },
        { status: 502 }
      );
    }

    const data: AbstractResp = await resp.json();
    const code = (data.currency?.currency_code || "INR").toUpperCase();
    const ratePack = INR_RATES[code] || INR_RATES.INR;
    const converted = Math.round(baseInr * ratePack.rate);

    return NextResponse.json({
      ok: true,
      ip: data.ip_address,
      country: data.country,
      currency: {
        code,
        symbol: ratePack.symbol,
      },
      price: {
        baseInr,
        converted,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
