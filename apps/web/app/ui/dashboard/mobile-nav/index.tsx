"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authService } from "../../../../services/auth-service";
import { useRouter } from "next/navigation";
import {
  House,
  CalendarBlank,
  Users,
  UserCircle,
  MagnifyingGlass,
  Stethoscope,
  SignOut,
  Plus,
} from "@phosphor-icons/react";

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
};

const MobileNav = ({ role }: { role: string }) => {
  const pathname = usePathname();
  const router = useRouter();

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case "ADMIN":
        return [];
      case "PROFESSIONAL":
        return [
          {
            name: "Início",
            href: "/dashboard/professional",
            icon: <House size={22} />,
            activeIcon: <House size={22} weight="fill" />,
          },
          {
            name: "Agenda",
            href: "/dashboard/professional/schedule",
            icon: <CalendarBlank size={22} />,
            activeIcon: <CalendarBlank size={22} weight="fill" />,
          },
          {
            name: "Pacientes",
            href: "/dashboard/professional/patients",
            icon: <Stethoscope size={22} />,
            activeIcon: <Stethoscope size={22} weight="fill" />,
          },
          {
            name: "Perfil",
            href: "/dashboard/professional/profile",
            icon: <UserCircle size={22} />,
            activeIcon: <UserCircle size={22} weight="fill" />,
          },
        ];
      case "MANAGER":
        return [
          {
            name: "Início",
            href: "/dashboard/manager",
            icon: <House size={22} />,
            activeIcon: <House size={22} weight="fill" />,
          },
          {
            name: "Pacientes",
            href: "/dashboard/manager/patients",
            icon: <Users size={22} />,
            activeIcon: <Users size={22} weight="fill" />,
          },
          {
            name: "Agendar",
            href: "/dashboard/manager/appointments/new",
            icon: <Plus size={22} />,
            activeIcon: <Plus size={22} weight="fill" />,
          },
          {
            name: "Consultas",
            href: "/dashboard/manager/appointments",
            icon: <CalendarBlank size={22} />,
            activeIcon: <CalendarBlank size={22} weight="fill" />,
          },
        ];
      default:
        return [
          {
            name: "Início",
            href: "/dashboard/patient",
            icon: <House size={22} />,
            activeIcon: <House size={22} weight="fill" />,
          },
          {
            name: "Buscar",
            href: "/dashboard/patient/search",
            icon: <MagnifyingGlass size={22} />,
            activeIcon: <MagnifyingGlass size={22} weight="fill" />,
          },
          {
            name: "Consultas",
            href: "/dashboard/patient/appointments",
            icon: <CalendarBlank size={22} />,
            activeIcon: <CalendarBlank size={22} weight="fill" />,
          },
          {
            name: "Perfil",
            href: "/dashboard/patient/profile",
            icon: <UserCircle size={22} />,
            activeIcon: <UserCircle size={22} weight="fill" />,
          },
        ];
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    authService.logout();
    router.push("/auth/login");
  };

  if (navItems.length === 0) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center border-t border-gray-200 bg-white md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={`Acessar ${item.name}`}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-3 text-xs font-medium no-underline transition-colors ${
              isActive ? "text-sky-600" : "text-slate-400"
            }`}
          >
            {isActive ? item.activeIcon : item.icon}
            {item.name}
          </Link>
        );
      })}
      <button
        onClick={handleLogout}
        title="Sair do sistema"
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-3 text-xs font-medium text-slate-400 transition-colors hover:text-red-500"
      >
        <SignOut size={22} />
        Sair
      </button>
    </nav>
  );
};

export default MobileNav;
