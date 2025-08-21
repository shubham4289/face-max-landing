// app/api/admin/sections/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/app/lib/db";
import { ensureTables } from "@/app/lib/bootstrap";
import { requireAdminEmail } from "@/app/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    requireAdminEmail();
    await ensureTables();

    const rows = (await sql`
      SELECT id, title, order_index
      FROM sections
      ORDER BY order_index ASC, created_at ASC
    `) as { id: string; title: string; order_index: number }[];

    return NextResponse.json({ ok: true, sections: rows });
  } catch (e: any) {
    const status = e?.status || 500;
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status });
  }
}

export async function POST(req: Request) {
  try {
    requireAdminEmail();
    await ensureTables();

    const body = await req.json().catch(() => ({}));
    const titleRaw = String(body?.title ?? "").trim();
    const orderRaw = body?.orderIndex ?? body?.order_index ?? 0;

    if (!titleRaw) {
      return NextResponse.json({ ok: false, error: "Title is required" }, { status: 400 });
    }

    const orderIndex = Number.parseInt(String(orderRaw), 10);
    const orderSafe = Number.isFinite(orderIndex) ? orderIndex : 0;

    // Insert (id generated in DB default or use random if your schema needs it)
    await sql`
      INSERT INTO sections (title, order_index)
      VALUES (${titleRaw}, ${orderSafe})
    `;

    const rows = (await sql`
      SELECT id, title, order_index
      FROM sections
      ORDER BY order_index ASC, created_at ASC
    `) as { id: string; title: string; order_index: number }[];

    return NextResponse.json({ ok: true, sections: rows });
  } catch (e: any) {
    const status = e?.status || 500;
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status });
  }
}
