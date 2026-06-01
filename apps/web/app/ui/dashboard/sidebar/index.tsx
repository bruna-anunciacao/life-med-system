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
  ChevronLeft,
  ChevronRight,
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
  const { setOpenMobile, state, toggleSidebar } = useSidebar();

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
      <SidebarHeader className="flex h-16 flex-row items-center justify-between border-b border-sidebar-border px-4 transition-all duration-200 group-data-[collapsible=icon]:h-auto group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-4 group-data-[collapsible=icon]:py-4 group-data-[collapsible=icon]:px-0">
        <Link
          href={`/dashboard/${role.toLowerCase()}`}
          className="flex shrink-0 items-center justify-center transition-all duration-200 origin-center group-data-[collapsible=icon]:scale-90"
        >
          <LifeMedLogo height={28} width={75} />
        </Link>

        <button
          onClick={toggleSidebar}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors [&_svg]:!size-6"
          title={state === "collapsed" ? "Expandir menu" : "Recolher menu"}
        >
          {state === "collapsed" ? <ChevronRight /> : <ChevronLeft />}
        </button>
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
                        className={`w-full flex items-center gap-3 h-12 px-3 transition-colors group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!w-12 group-data-[collapsible=icon]:!h-12 [&_svg]:!size-6 ${
                          isActive
                            ? "!bg-sky-200 !text-sky-950 !font-semibold hover:!bg-sky-300"
                            : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                        }`}
                      >
                        <item.icon className="shrink-0" />
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

      <SidebarFooter className="border-t border-sidebar-border p-4 group-data-[collapsible=icon]:p-4 group-data-[collapsible=icon]:items-center">
        <SidebarMenu className="w-full">
          <SidebarMenuItem className="w-full flex justify-center">
            <SidebarMenuButton
              onClick={handleLogout}
              className="flex items-center gap-3 h-12 px-3 text-red-600 hover:text-red-800 hover:bg-red-100 w-full transition-colors group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!w-12 group-data-[collapsible=icon]:!h-12 [&_svg]:!size-6"
              tooltip="Sair"
            >
              <LogOut className="shrink-0" />
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
