"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Sidebar from "../ui/dashboard/sidebar";
import MobileNav from "../ui/dashboard/mobile-nav";
import { Spinner } from "@/components/ui/spinner";
import { LifeMedLogo } from "../ui/life-med-logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { authService } from "../../services/auth-service";
import { useRouter } from "next/navigation";

const DashboardLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [role, setRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userRole = Cookies.get("user-role");
    if (userRole) {
      setRole(userRole);
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    authService.logout();
    router.push("/auth/login");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-row h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="flex md:hidden h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
          <Link href={`/dashboard/${role.toLowerCase()}`}>
            <LifeMedLogo height={24} width={65} />
          </Link>
          {role !== "ADMIN" && (
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="size-5 text-red-600" />
            </Button>
          )}
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
          {children}
        </main>
        <MobileNav role={role} />
      </div>
    </div>
  );
};

export default DashboardLayout;
