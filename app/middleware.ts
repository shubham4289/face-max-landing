// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const enabled = process.env.MAINTENANCE_MODE === "1";
  if (!enabled) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Allow assets, maintenance page itself, and APIs if needed
  const allowed =
    pathname.startsWith("/maintenance") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/logo.png") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/api");

  if (allowed) return NextResponse.next();

  // Rewrite all other paths to the maintenance page
  const url = req.nextUrl.clone();
  url.pathname = "/maintenance";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: "/:path*",
};
