import { Button, Link } from "@heroui/react";
import { ArrowRightFromSquare } from "@gravity-ui/icons";
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
        return [
          { name: "Painel Admin", href: "/dashboard/admin" },
          { name: "Usuários", href: "/dashboard/admin/users" },
        ];
      case "PROFESSIONAL":
        return [
          { name: "Agenda", href: "/dashboard/professional" },
          { name: "Pacientes", href: "/dashboard/professional/patients" },
          { name: "Disponibilidade", href: "/dashboard/professional/schedule" },
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
          variant="danger-soft"
          onClick={handleLogout}
          className={styles.logoutButton}
        >
          <ArrowRightFromSquare />
          Sair
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
