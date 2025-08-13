import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const key = process.env.ABSTRACT_IPGEO_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Missing ABSTRACT_IPGEO_API_KEY" }, { status: 500 });
  }

  // Try to grab the real client IP from headers (works on Vercel)
  const fwd = req.headers.get("x-forwarded-for");
  const ip =
    req.ip ||
    (fwd ? fwd.split(",")[0].trim() : null) ||
    req.headers.get("x-real-ip") ||
    undefined;

  const url = new URL("https://ipgeolocation.abstractapi.com/v1/");
  url.searchParams.set("api_key", key);
  if (ip) url.searchParams.set("ip_address", ip); // ensure we geolocate the visitor, not the server

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: "Abstract API error", detail: text }, { status: 502 });
    }
    const data = await res.json();

    // normalize a small response we’ll use on the client
    return NextResponse.json({
      country_code: data?.country_code || data?.country?.code || null,
      currency: {
        code: data?.currency?.code || null,
        symbol: data?.currency?.symbol || null,
        name: data?.currency?.name || null,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Geo lookup failed" }, { status: 500 });
  }
}
