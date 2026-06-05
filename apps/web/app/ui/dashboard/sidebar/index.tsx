"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { LifeMedLogo } from "../../life-med-logo";
import { authService } from "../../../../services/auth-service";
import { getNavItems } from "../nav-items";
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

  const navItems = getNavItems(role);

  const handleLogout = () => {
    authService.logout();
    router.push("/auth/login");
  };

  return (
    <Sidebar
      collapsible="icon"
      className="group-data-[side=left]:border-r-0"
    >
      <SidebarHeader className="h-14 flex items-center justify-center">
        <Link
          href={`/dashboard/${role.toLowerCase()}`}
          className="flex items-center justify-center"
        >
          <LifeMedLogo height={24} width={64} />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={
                        <Link
                          href={item.href}
                          onClick={() => setOpenMobile(false)}
                        />
                      }
                      isActive={isActive}
                      tooltip={item.name}
                    >
                      <item.icon />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Sair"
              className="text-destructive hover:text-destructive"
            >
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
