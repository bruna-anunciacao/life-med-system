"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LifeMedLogo } from "../../life-med-logo";
import { authService } from "../../../../services/auth-service";
import {
  LogOut,
  Home,
  Calendar,
  Users,
  FileText,
  User,
  Search,
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Sidebar = ({ role }: { role: string }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(role === "ADMIN");

  const getNavItems = () => {
    switch (role) {
      case "ADMIN":
        return [];
      case "PROFESSIONAL":
        return [
          { name: "Início", href: "/dashboard/professional", icon: Home },
          {
            name: "Agenda",
            href: "/dashboard/professional/schedule",
            icon: Calendar,
          },
          {
            name: "Pacientes",
            href: "/dashboard/professional/patients",
            icon: Users,
          },
          {
            name: "Prontuários",
            href: "/dashboard/professional/medical-records",
            icon: FileText,
          },
          {
            name: "Perfil",
            href: "/dashboard/professional/profile",
            icon: User,
          },
        ];
      case "MANAGER":
        return [
          { name: "Início", href: "/dashboard/manager", icon: Home },
          {
            name: "Pacientes",
            href: "/dashboard/manager/patients",
            icon: Users,
          },
          {
            name: "Agendamentos",
            href: "/dashboard/manager/appointments",
            icon: CalendarDays,
          },
          {
            name: "Agendar",
            href: "/dashboard/manager/appointments/new",
            icon: CalendarPlus,
          },
        ];
      default:
        return [
          { name: "Início", href: "/dashboard/patient", icon: Home },
          {
            name: "Buscar Médicos",
            href: "/dashboard/patient/search",
            icon: Search,
          },
          {
            name: "Consultas",
            href: "/dashboard/patient/appointments",
            icon: Calendar,
          },
          {
            name: "Prontuários",
            href: "/dashboard/patient/medical-records",
            icon: FileText,
          },
          { name: "Perfil", href: "/dashboard/patient/profile", icon: User },
        ];
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    authService.logout();
    router.push("/auth/login");
  };

  return (
    <aside
      className={`hidden md:flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 shrink-0 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div
        className={`flex h-16 shrink-0 items-center border-b border-gray-200 transition-all duration-300 ${
          isCollapsed ? "justify-center px-0" : "justify-between px-6"
        }`}
      >
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isCollapsed ? "w-0 opacity-0" : "w-[75px] opacity-100"
          }`}
        >
          <Link
            href={`/dashboard/${role.toLowerCase()}`}
            className="block whitespace-nowrap"
          >
            <LifeMedLogo height={28} width={75} />
          </Link>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="shrink-0 text-slate-500 hover:text-slate-700"
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {isCollapsed ? (
            <ChevronRight className="size-5" />
          ) : (
            <ChevronLeft className="size-5" />
          )}
        </Button>
      </div>

      <nav
        className={`flex-1 overflow-y-auto py-6 flex flex-col gap-2 transition-all duration-300 ${
          isCollapsed ? "px-3" : "px-4"
        }`}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center rounded-lg py-2.5 transition-colors duration-200 overflow-hidden ${
                isCollapsed ? "justify-center px-0" : "px-3 gap-3"
              } ${
                isActive
                  ? "bg-sky-100 font-semibold text-sky-700"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon className="size-5 shrink-0" />
              <span
                className={`text-sm whitespace-nowrap transition-all duration-300 ${
                  isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-gray-200 p-4">
        <Button
          variant="destructive"
          className={`w-full flex items-center overflow-hidden transition-all duration-300 ${
            isCollapsed ? "justify-center px-0" : "justify-start gap-2 px-4"
          }`}
          onClick={handleLogout}
          title={isCollapsed ? "Sair" : undefined}
        >
          <LogOut className="size-4 shrink-0" />
          <span
            className={`whitespace-nowrap transition-all duration-300 ${
              isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
            }`}
          >
            Sair
          </span>
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
