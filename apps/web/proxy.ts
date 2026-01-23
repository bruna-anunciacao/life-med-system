import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const role = request.cookies.get("user-role")?.value;
  const { pathname } = request.nextUrl;
  const signInUrl = new URL("/auth/login", request.url);

  const getDashboardUrl = (userRole: string | undefined) => {
    if (userRole === "ADMIN") return new URL("/dashboard/admin", request.url);
    if (userRole === "PROFESSIONAL") return new URL("/dashboard/professional", request.url);
    return new URL("/dashboard/patient", request.url);
  };

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAuthRoute = pathname.startsWith("/auth");

  if (isDashboardRoute) {
    if (!token) {
      return NextResponse.redirect(signInUrl);
    }

    if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
      return NextResponse.redirect(getDashboardUrl(role));
    }

    if (pathname.startsWith("/dashboard/professional") && role !== "PROFESSIONAL") {
      return NextResponse.redirect(getDashboardUrl(role));
    }

    if (pathname.startsWith("/dashboard/patient") && role !== "PATIENT") {
       return NextResponse.redirect(getDashboardUrl(role));
    }
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(getDashboardUrl(role));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};