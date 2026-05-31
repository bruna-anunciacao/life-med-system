"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

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
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border group-data-[collapsible=icon]:p-0">
        <Link
          href={`/dashboard/${role.toLowerCase()}`}
          className="flex items-center justify-center overflow-hidden transition-all group-data-[collapsible=icon]:w-full"
        >
          <LifeMedLogo height={28} width={75} />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 px-2 mt-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem
                    key={item.href}
                    className="w-full flex justify-center"
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpenMobile(false)}
                      className="block w-full"
                    >
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.name}
                        className={`w-full flex items-center gap-3 h-11 px-3 transition-colors group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center ${
                          isActive
                            ? "!bg-sky-200 !text-sky-950 !font-semibold hover:!bg-sky-300"
                            : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                        }`}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="truncate text-base group-data-[collapsible=icon]:hidden">
                          {item.name}
                        </span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:items-center">
        <SidebarMenu className="w-full">
          <SidebarMenuItem className="w-full flex justify-center">
            <SidebarMenuButton
              onClick={handleLogout}
              className="flex items-center gap-3 h-11 px-3 text-red-600 hover:text-red-800 hover:bg-red-100 w-full transition-colors group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center"
              tooltip="Sair"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span className="text-base font-medium group-data-[collapsible=icon]:hidden">
                Sair
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
