import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Role-gated path prefixes — each must start with the role name.
const ROLE_PREFIXES = ["victim", "volunteer", "ngo", "admin", "donor"];

export async function middleware(request) {
  // Start with a plain next() response so we can attach refreshed cookies.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookies to both the forwarded request and the response so
          // the refreshed session token reaches the browser.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: getUser() validates the JWT server-side on every request.
  // Never use getSession() for auth checks — it only reads the local cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Determine which role-gated section (if any) this path sits under.
  const matchedPrefix = ROLE_PREFIXES.find(
    (p) => pathname === `/${p}` || pathname.startsWith(`/${p}/`)
  );

  if (matchedPrefix) {
    // 1. No session → send to login.
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }

    // Role is stored in user_metadata (set at signup via options.data).
    const role = user.user_metadata?.role ?? "victim";

    // 2. Wrong section for this role → redirect to their own dashboard.
    if (matchedPrefix !== role) {
      const dashUrl = request.nextUrl.clone();
      dashUrl.pathname = `/${role}/dashboard`;
      return NextResponse.redirect(dashUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Run on every request except static assets, images, and Next internals.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
