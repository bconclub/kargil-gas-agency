import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession, roleHome } from "./lib/session";

const PUBLIC_PATHS = ["/login"];

// which roles may enter which top-level sections
const SECTION_ROLES: Record<string, Array<"ADMIN" | "USER" | "CEO">> = {
  "/dashboard": ["ADMIN", "USER", "CEO"],
  "/entry": ["ADMIN", "USER"],
  "/admin": ["ADMIN"],
  "/reports": ["ADMIN", "USER", "CEO"],
  "/calendar": ["ADMIN", "USER", "CEO"],
  "/day": ["ADMIN", "USER", "CEO"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/health")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const section = Object.keys(SECTION_ROLES).find((s) => pathname.startsWith(s));
  if (section && !SECTION_ROLES[section].includes(session.role)) {
    const url = req.nextUrl.clone();
    url.pathname = roleHome(session.role);
    return NextResponse.redirect(url);
  }

  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = roleHome(session.role);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals and any static asset by extension — otherwise the auth
  // redirect intercepts public images (e.g. the login-page logo) for signed-out
  // visitors and they render broken.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|txt|xml)$).*)"],
};
