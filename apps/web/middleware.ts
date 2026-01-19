import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const role = request.cookies.get("user-role")?.value;

  const signInUrl = new URL("/auth/login", request.url);
  const dashboardUrl = new URL("/dashboard/patient", request.url);

  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");

  if (isDashboardRoute && !token) {
    return NextResponse.redirect(signInUrl);
  }
  if (isAuthRoute && token) {
    if (role === "PROFESSIONAL") {
      return NextResponse.redirect(
        new URL("/dashboard/professional", request.url),
      );
    }

    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }

    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
