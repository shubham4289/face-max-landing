import "server-only";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { sql } from "@/app/lib/db";
import { ensureTables } from "@/app/lib/bootstrap";
import { getSession } from "@/app/lib/cookies";
import { randomId } from "@/app/lib/crypto";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = getSession();
    const admin = process.env.ADMIN_EMAIL?.toLowerCase().trim() || "";
    if (!session?.email || session.email.toLowerCase() !== admin) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await ensureTables();

    const rows = (await sql`
      SELECT id, section_id, title, order_index, video_id, duration_min
      FROM lectures
      ORDER BY order_index ASC, created_at ASC;
    `) as {
      id: string;
      section_id: string;
      title: string;
      order_index: number;
      video_id: string | null;
      duration_min: number | null;
    }[];

    return NextResponse.json({ ok: true, lectures: rows });
  } catch (err) {
    console.error("[admin/lectures] failed:", err);
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

    await ensureTables();

    const body = await req.json().catch(() => ({} as any));
    const sectionId = (body.sectionId ?? "").toString().trim();
    const title = (body.title ?? "").toString().trim();
    const orderIndex = Number.isFinite(Number(body.orderIndex)) ? Number(body.orderIndex) : 0;
    const videold = (body.videold ?? "").toString().trim();
    const durationMin = body.durationMin == null
      ? null
      : Number.isFinite(Number(body.durationMin))
        ? Math.max(0, Number(body.durationMin))
        : null;

    if (!sectionId)
      return NextResponse.json({ ok: false, error: "Invalid sectionId" }, { status: 400 });
    if (!title || title.length > 200)
      return NextResponse.json({ ok: false, error: "Invalid title" }, { status: 400 });
    if (!videold)
      return NextResponse.json({ ok: false, error: "Invalid videold" }, { status: 400 });

    const id = randomId();
    await sql`
      INSERT INTO lectures (id, section_id, title, order_index, video_id, duration_min)
      VALUES (${id}, ${sectionId}, ${title}, ${orderIndex}, ${videold}, ${durationMin})
    `;

    return NextResponse.json({
      ok: true,
      id,
      sectionId,
      title,
      orderIndex,
      videold,
      durationMin,
    });
  } catch (err) {
    console.error("[admin/lectures] failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
