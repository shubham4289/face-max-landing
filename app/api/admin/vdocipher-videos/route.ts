import { NextResponse } from 'next/server';
import { assertAdmin } from '@/app/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    assertAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiSecret = process.env.VDOCIPHER_API_SECRET;
  if (!apiSecret) {
    return NextResponse.json({ error: 'VDOCIPHER_API_SECRET missing' }, { status: 500 });
  }

  const url = new URL(req.url);
  const page = url.searchParams.get('page') || '';
  const limit = url.searchParams.get('limit') || '';

  const qs = new URLSearchParams();
  if (page) qs.set('page', page);
  if (limit) qs.set('limit', limit);

  const endpoint = `https://dev.vdocipher.com/api/videos${qs.toString() ? `?${qs.toString()}` : ''}`;

  const resp = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
      Authorization: `Apisecret ${apiSecret}`,
    },
    cache: 'no-store',
  });

  if (!resp.ok) {
    const errText = await resp.text();
    return NextResponse.json({ error: `VdoCipher error: ${errText}` }, { status: 502 });
  }

  const raw = await resp.json();
  const rows: any[] = Array.isArray(raw?.rows)
    ? raw.rows
    : Array.isArray(raw?.videos)
    ? raw.videos
    : Array.isArray(raw)
    ? raw
    : [];

  const items = rows.map((r: any) => ({
    id: r.id || r._id || r.videoId,
    title: r.title || r.name || 'Untitled',
    duration: r.duration || r.length || null,
    createdAt: r.createdAt || r.created_time || r.created || null,
  }));

  return NextResponse.json({ items, total: items.length });
}
