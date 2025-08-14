// middleware.ts (ENV TOGGLE)
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const isOn = process.env.MAINTENANCE_MODE === "1";

export function middleware(req: NextRequest) {
  if (!isOn) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // allow assets, maintenance page itself, and APIs if you want
  const allowed =
    pathname.startsWith("/maintenance") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/logo.png") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/api");

  if (allowed) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/maintenance";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: "/:path*",
};
