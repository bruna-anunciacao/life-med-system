"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import DashboardHeader from "../ui/dashboard/header";
import { Spinner } from "@heroui/react";

const DashboardLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [role, setRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userRole = Cookies.get("user-role");
    if (userRole) {
      setRole(userRole);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader role={role} />
      <main className="ml-64 flex-1 p-8 overflow-y-auto h-full">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
