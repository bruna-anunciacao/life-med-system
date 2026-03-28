import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./header.module.css";
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
    <header className={styles.container}>
      <div className={styles.left}>
        <Image src={Logo} alt="Life Med Logo" height={100} />
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className={styles.right}>
        <Button
          variant="destructive"
          onClick={handleLogout}
          className={styles.logoutButton}
        >
          <LogOut className="size-4" />
          Sair
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
