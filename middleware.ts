import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Minimal auth gate: redirect unauthenticated users to /auth/login.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Explicit allow for auth routes and favicon
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/auth/") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/login")
  ) {
    return NextResponse.next();
  }

  // Allow requests for typical static asset extensions (served from public)
  if (/\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js|map|woff|woff2|ttf)$/i.test(pathname)) {
    return NextResponse.next();
  }

  // If no session token cookie, send to /auth/login with callback
  const hasSessionCookie =
    req.cookies.has("next-auth.session-token") ||
    req.cookies.has("__Secure-next-auth.session-token");
  if (!hasSessionCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set(
      "callbackUrl",
      req.nextUrl.pathname + req.nextUrl.search
    );
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip middleware for API routes, Next.js internals, and the favicon
  matcher: [
    "/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico).*)",
  ],
};
