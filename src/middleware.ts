import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host =
    req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const hostname = host.split(":")[0].toLowerCase();
  const { pathname, search } = req.nextUrl;

  // Check if current request is arriving on the admin subdomain
  const isAdminSubdomain =
    hostname === "admin.jewelpalacemumbai.com" ||
    hostname === "admin.localhost" ||
    hostname === "admin.127.0.0.1" ||
    (hostname.startsWith("admin.") && !hostname.includes("pages.dev"));

  // Case 1: Request arrives on admin subdomain (e.g. admin.jewelpalacemumbai.com or admin.localhost:3000)
  if (isAdminSubdomain) {
    const url = req.nextUrl.clone();

    // Internally rewrite all paths to /admin...
    if (!pathname.startsWith("/admin")) {
      url.pathname = `/admin${pathname === "/" ? "" : pathname}`;
    }

    return NextResponse.rewrite(url);
  }

  // Case 2: Request arrives on root/apex domain for /admin
  // Immediately redirect to '/' so storefront visitors NEVER see the admin login
  if (
    !isAdminSubdomain &&
    (pathname === "/admin" || pathname.startsWith("/admin/"))
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static assets)
     * - _next/image (image optimization)
     * - api routes
     * - public asset files (images, icons, manifest)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icon.jpeg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
