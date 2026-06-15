"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authService } from "../../../../services/auth-service";
import { getNavItems } from "../nav-items";

export function MobileNav({ role }: { role: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = getNavItems(role);

  const handleLogout = () => {
    authService.logout();
    router.push("/auth/login");
  };

  return (
    <nav
      id="tour-mobile-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-[72px] w-full items-center justify-around bg-white border-t border-slate-200 px-1 pb-safe"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              isActive ? "text-sky-600" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Icon className="h-6 w-6" />
            <span className="text-[11px] font-medium leading-none truncate max-w-full px-0.5">
              {item.name}
            </span>
          </Link>
        );
      })}

      <button
        onClick={handleLogout}
        className="flex flex-col items-center justify-center w-full h-full gap-1 transition-colors text-red-500 hover:text-red-700"
      >
        <LogOut className="h-6 w-6" />
        <span className="text-[11px] font-medium leading-none">Sair</span>
      </button>
    </nav>
  );
}
