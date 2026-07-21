import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminToken } from "@/lib/admin-auth";

// Next.js 16: "middleware" fue renombrado a "proxy". Corre en runtime Node.js
// por defecto (no Edge), por eso podemos usar node:crypto en lib/admin-auth.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // La página de login tiene que quedar accesible sin sesión, si no nadie
  // podría loguearse nunca.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (isValidAdminToken(token)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.json({ error: "No autorizado." }, { status: 401 });
}

export const config = {
  matcher: ["/admin/:path*", "/api/orders/:path*", "/api/products/:path*"],
};
