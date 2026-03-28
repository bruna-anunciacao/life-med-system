import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { authService } from "../../../../services/auth-service";
import { useRouter } from "next/navigation";
import Logo from "../../../life-med-logo.png";

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
    <header className="flex h-16 w-full items-center border-b border-gray-200 bg-white px-6">
      <div className="flex items-center">
        <Image src={Logo} alt="Life Med Logo" height={100} />
      </div>

      <nav className="ml-8 flex flex-1 gap-3">
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

      <div className="flex items-center gap-3">
        <Button variant="destructive" onClick={handleLogout} className="px-4">
          <LogOut className="size-4" />
          Sair
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
