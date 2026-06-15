import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  PATIENT_APPROVAL_STATUS_KEY,
  QUESTIONNAIRE_COMPLETED_KEY,
} from "./lib/auth-constants";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const role = request.cookies.get("user-role")?.value;
  const questionnaireCompleted = request.cookies.get(
    QUESTIONNAIRE_COMPLETED_KEY,
  )?.value;
  const patientApprovalStatus = request.cookies.get(
    PATIENT_APPROVAL_STATUS_KEY,
  )?.value;
  const { pathname } = request.nextUrl;
  const signInUrl = new URL("/auth/login", request.url);
  const patientQuestionnaireUrl = new URL(
    "/dashboard/patient/questionnaire",
    request.url,
  );
  const patientPendingApprovalUrl = new URL(
    "/auth/patient-pending-approval",
    request.url,
  );
  const patientRejectedUrl = new URL("/auth/patient-rejected", request.url);

  const getDashboardUrl = (userRole: string | undefined) => {
    if (userRole === "ADMIN") return new URL("/dashboard/admin", request.url);
    if (userRole === "PROFESSIONAL")
      return new URL("/dashboard/professional", request.url);
    if (userRole === "MANAGER")
      return new URL("/dashboard/manager", request.url);
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

    if (
      pathname.startsWith("/dashboard/professional") &&
      role !== "PROFESSIONAL"
    ) {
      return NextResponse.redirect(getDashboardUrl(role));
    }

    if (pathname.startsWith("/dashboard/manager") && role !== "MANAGER") {
      return NextResponse.redirect(getDashboardUrl(role));
    }

    if (pathname.startsWith("/dashboard/patient") && role !== "PATIENT") {
      return NextResponse.redirect(getDashboardUrl(role));
    }

    if (role === "PATIENT" && patientApprovalStatus === "REJECTED") {
      return NextResponse.redirect(patientRejectedUrl);
    }

    if (
      role === "PATIENT" &&
      questionnaireCompleted === "false" &&
      pathname.startsWith("/dashboard/patient") &&
      pathname !== "/dashboard/patient/questionnaire"
    ) {
      return NextResponse.redirect(patientQuestionnaireUrl);
    }

    if (
      role === "PATIENT" &&
      questionnaireCompleted === "true" &&
      patientApprovalStatus === "PENDING"
    ) {
      return NextResponse.redirect(patientPendingApprovalUrl);
    }

    if (
      role === "PATIENT" &&
      questionnaireCompleted === "true" &&
      pathname === "/dashboard/patient/questionnaire"
    ) {
      return NextResponse.redirect(getDashboardUrl(role));
    }
  }

  if (isAuthRoute && token) {
    if (role === "PATIENT" && patientApprovalStatus === "REJECTED") {
      if (pathname !== "/auth/patient-rejected") {
        return NextResponse.redirect(patientRejectedUrl);
      }
      return NextResponse.next();
    }

    if (role === "PATIENT" && questionnaireCompleted === "false") {
      return NextResponse.redirect(patientQuestionnaireUrl);
    }

    if (role === "PATIENT" && patientApprovalStatus === "PENDING") {
      if (pathname !== "/auth/patient-pending-approval") {
        return NextResponse.redirect(patientPendingApprovalUrl);
      }
      return NextResponse.next();
    }

    if (
      role === "PATIENT" &&
      patientApprovalStatus === "APPROVED" &&
      (pathname === "/auth/patient-pending-approval" ||
        pathname === "/auth/patient-rejected")
    ) {
      return NextResponse.redirect(getDashboardUrl(role));
    }

    return NextResponse.redirect(getDashboardUrl(role));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
