import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/app/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || "Test User";
  const email = searchParams.get("email");
  const password = searchParams.get("password");

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  // hash password
  const hashedPassword = await hash(password, 10);

  // create user in DB
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
