// app/api/admin/sections/route.ts
import "server-only";
import { NextResponse } from "next/server";
import { sql } from "@/app/lib/db";
import { ensureTables } from "@/app/lib/bootstrap";
import { getSession } from "@/app/lib/cookies";
import { randomId } from "@/app/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = getSession();
    const admin = process.env.ADMIN_EMAIL?.toLowerCase().trim() || "";
    if (!session?.email || session.email.toLowerCase() !== admin) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await ensureTables;

    const rows = (await sql`
      SELECT id, title, order_index
      FROM sections
      ORDER BY order_index ASC, created_at ASC
    `) as { id: string; title: string; order_index: number }[];

    return NextResponse.json({ ok: true, sections: rows });
  } catch (err) {
    console.error("[admin/sections] failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = getSession();
    const admin = process.env.ADMIN_EMAIL?.toLowerCase().trim() || "";
    if (!session?.email || session.email.toLowerCase() !== admin) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await ensureTables;

    const { title, orderIndex } = await req.json().catch(() => ({} as any));
    const name = (title ?? "").toString().trim();
    const idx = Number.isFinite(Number(orderIndex)) ? Number(orderIndex) : 0;
    if (!name || name.length > 120) {
      return NextResponse.json({ ok: false, error: "Invalid title" }, { status: 400 });
    }

    const id = randomId();
    await sql`
      INSERT INTO sections (id, title, order_index)
      VALUES (${id}, ${name}, ${idx})
    `;

    return NextResponse.json({ ok: true, id, title: name, orderIndex: idx });
  } catch (err) {
    console.error("[admin/sections] failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
