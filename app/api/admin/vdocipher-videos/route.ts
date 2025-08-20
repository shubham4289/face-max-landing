import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/cookies";
import { isAdmin } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sess = getSession();
  if (!sess?.email || !isAdmin(sess.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const apiSecret = process.env.VDOCIPHER_API_SECRET;
  if (!apiSecret) {
    return NextResponse.json(
      { error: "VDOCIPHER_API_SECRET missing" },
      { status: 500 }
    );
  }

  // optional pagination (?page=1&limit=20) – if you don’t pass them, you’ll get the default first page
  const url = new URL(req.url);
  const page = url.searchParams.get("page") || "";
  const limit = url.searchParams.get("limit") || "";

  const qs = new URLSearchParams();
  if (page) qs.set("page", page);
  if (limit) qs.set("limit", limit);

  const endpoint = `https://dev.vdocipher.com/api/videos${
    qs.toString() ? `?${qs.toString()}` : ""
  }`;

  const resp = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      Authorization: `Apisecret ${apiSecret}`,
    },
    cache: "no-store",
  });

  if (!resp.ok) {
    const errText = await resp.text();
    return NextResponse.json({ error: `VdoCipher error: ${errText}` }, { status: 502 });
  }

  const raw = await resp.json();

  // Try to be flexible with the response shape
  const rows: any[] = Array.isArray(raw?.rows)
    ? raw.rows
    : Array.isArray(raw?.videos)
    ? raw.videos
    : Array.isArray(raw)
    ? raw
    : [];

  const items = rows.map((r: any) => ({
    id: r.id || r._id || r.videoId,
    title: r.title || r.name || "Untitled",
    duration: r.duration || r.length || null,
    createdAt: r.createdAt || r.created_time || r.created || null,
  }));

  return NextResponse.json({ items, total: items.length });
}
