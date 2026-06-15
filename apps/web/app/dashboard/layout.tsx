"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "../ui/dashboard/sidebar";
import { MobileNav } from "../ui/dashboard/mobile-navbar";
import { Spinner } from "@/components/ui/spinner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LifeMedLogo } from "../ui/life-med-logo";
import Link from "next/link";
import { useUserQuery } from "@/queries/useUserQuery";
import { NextStep, NextStepProvider } from "nextstepjs";
import { getTours } from "@/components/tour/tours";
import { TourCard } from "@/components/tour/TourCard";
import { useIsMobile } from "@/hooks/useIsMobile";

const DashboardLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const router = useRouter();
  const { data: user } = useUserQuery();
  const [role, setRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const userRole = Cookies.get("user-role");
    if (userRole) {
      setRole(userRole);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user?.role !== "PATIENT") return;
    const profile = user.patientProfile;
    if (profile?.approvalStatus === "REJECTED") {
      router.replace("/auth/patient-rejected");
      return;
    }
    if (!profile?.questionnaireCompleted) {
      router.replace("/dashboard/patient/questionnaire");
      return;
    }
    if (profile.approvalStatus === "PENDING") {
      router.replace("/auth/patient-pending-approval");
      return;
    }
  }, [router, user]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  const defaultOpen = role !== "ADMIN";

  return (
    <NextStepProvider>
      <NextStep
        steps={getTours(isMobile)}
        cardComponent={TourCard}
        shadowRgb="15,23,42"
        shadowOpacity="0.6"
      >
        <SidebarProvider
          defaultOpen={defaultOpen}
          style={
            {
              "--sidebar-width": "13rem",
              "--sidebar-width-icon": "3rem",
            } as React.CSSProperties
          }
        >
          <AppSidebar role={role} />

          <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative bg-slate-50">
            <header className="hidden md:flex h-14 shrink-0 items-center gap-2 px-4">
              <SidebarTrigger />
            </header>

            <header className="flex md:hidden h-14 shrink-0 items-center border-b border-gray-200 bg-white px-4">
              <Link href={`/dashboard/${role.toLowerCase()}`}>
                <LifeMedLogo height={24} width={65} />
              </Link>
            </header>

            <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
              {children}
            </main>

            <MobileNav role={role} />
          </div>
        </SidebarProvider>
      </NextStep>
    </NextStepProvider>
  );
};

export default DashboardLayout;
