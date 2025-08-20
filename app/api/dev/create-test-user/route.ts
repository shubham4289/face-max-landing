import { NextResponse } from "next/server";
import { sql } from "@/app/lib/db";
import { ensureTables } from "@/app/lib/bootstrap";
import { hashPassword, randomId } from "@/app/lib/crypto";

export async function GET(req: Request) {
  // Optional safety: require a shared secret in the query (?key=...)
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (process.env.DEV_CREATE_USER_KEY && key !== process.env.DEV_CREATE_USER_KEY) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const name = url.searchParams.get("name") || "Test User";
  const email = url.searchParams.get("email")?.toLowerCase();
  const password = url.searchParams.get("password");

  if (!email || !password) {
    return NextResponse.json(
      { error: "Missing email or password" },
      { status: 400 }
    );
  }

  await ensureTables();

  // If user already exists, return existing id (idempotent)
  const existing = (await sql`
    SELECT id FROM users WHERE email = ${email} LIMIT 1
  `) as { id: string }[];

  if (existing.length) {
    return NextResponse.json({
      ok: true,
      userId: existing[0].id,
      note: "already exists",
    });
  }

  const id = randomId();
  const pwHash = await hashPassword(password);

  await sql`
    INSERT INTO users (id, email, name, password_hash)
    VALUES (${id}, ${email}, ${name}, ${pwHash})
  `;

  return NextResponse.json({ ok: true, userId: id });
}
