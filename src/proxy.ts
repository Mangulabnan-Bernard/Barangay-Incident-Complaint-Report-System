import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// Next.js 16 "proxy" (formerly "middleware"). Runs on the edge runtime, so it
// only imports the jose-based session verifier — no Prisma / bcrypt here.

const AUTH_PAGES = ["/login", "/register"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // Logged-in users shouldn't see the auth pages.
  if (AUTH_PAGES.includes(pathname)) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Everything else matched below is protected.
  if (!session) {
    const url = new URL("/login", req.url);
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/incidents/:path*",
    "/hearings/:path*",
    "/cases/:path*",
    "/summons/:path*",
    "/officials/:path*",
    "/residents/:path*",
    "/users/:path*",
    "/logs/:path*",
    "/archived/:path*",
    "/reports/:path*",
    "/zone/:path*",
    "/account/:path*",
    "/login",
    "/register",
  ],
};
