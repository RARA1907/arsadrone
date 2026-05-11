/**
 * Next.js 16 proxy (middleware) — /panel rotalarını korur.
 * @supabase/ssr createServerClient ile cookie-based session doğrulaması.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED = /^\/panel(?!\/login)/;

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!PROTECTED.test(pathname)) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  // @supabase/ssr: cookie-based session okuma
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    const loginUrl = new URL("/panel/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ["/panel/:path*"],
};
