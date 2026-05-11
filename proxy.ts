/**
 * Next.js middleware — /panel rotalarını korur.
 * Supabase session cookie yoksa /panel/login'e yönlendirir.
 */
import { NextRequest, NextResponse } from "next/server";

const PROTECTED = /^\/panel(?!\/login)/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!PROTECTED.test(pathname)) {
    return NextResponse.next();
  }

  // Supabase session cookie kontrolü
  // Cookie ismi: sb-<project-ref>-auth-token (veya supabase-auth-token)
  const hasCookie =
    Array.from(req.cookies.getAll()).some(
      (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"),
    ) ||
    req.cookies.has("supabase-auth-token");

  if (!hasCookie) {
    const loginUrl = new URL("/panel/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*"],
};
