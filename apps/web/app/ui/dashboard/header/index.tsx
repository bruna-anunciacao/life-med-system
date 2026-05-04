"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { authService } from "../../../../services/auth-service";
import { useRouter } from "next/navigation";
import { LifeMedLogo } from "../../life-med-logo";

const DashboardHeader = ({ role }: { role: string }) => {
  const pathname = usePathname();
  const router = useRouter();

  const getNavItems = () => {
    switch (role) {
      case "ADMIN":
        return [];
      case "PROFESSIONAL":
        return [
          { name: "Início", href: "/dashboard/professional" },
          { name: "Agenda", href: "/dashboard/professional/schedule" },
          { name: "Pacientes", href: "/dashboard/professional/patients" },
          { name: "Perfil", href: "/dashboard/professional/profile" },
        ];
      case "MANAGER":
        return [
          { name: "Início", href: "/dashboard/manager" },
          { name: "Pacientes", href: "/dashboard/manager/patients" },
          { name: "Agendamentos", href: "/dashboard/manager/appointments" },
        ];
      default:
        return [
          { name: "Início", href: "/dashboard/patient" },
          { name: "Buscar Médicos", href: "/dashboard/patient/search" },
          { name: "Consultas", href: "/dashboard/patient/appointments" },
          { name: "Perfil", href: "/dashboard/patient/profile" },
        ];
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    authService.logout();
    router.push("/auth/login");
  };

  return (
    <header className="flex h-14 w-full items-center border-b border-gray-200 bg-white px-6">
      <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
        <Link href={`/dashboard/${role.toLowerCase()}`}>
          <LifeMedLogo height={28} width={75} />
        </Link>
      </div>

      <nav className="ml-8 hidden flex-1 gap-3 md:flex">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium no-underline transition-colors duration-200 ${
                isActive
                  ? "bg-sky-100 font-semibold text-sky-700"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div
        className={`ml-auto flex items-center gap-3 ${role !== "ADMIN" ? "hidden md:flex" : ""}`}
      >
        <Button variant="destructive" size="lg" onClick={handleLogout}>
          <LogOut className="size-4" />
          Sair
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
