import {
  Calendar,
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  ClockAlert,
  FileText,
  Home,
  Search,
  Stethoscope,
  User,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export function getNavItems(role: string): NavItem[] {
  switch (role) {
    case "ADMIN":
      return [
        { name: "Início", href: "/dashboard/admin", icon: Home },
        {
          name: "Agendamentos",
          href: "/dashboard/admin/appointments",
          icon: CalendarDays,
        },
        {
          name: "Gestores",
          href: "/dashboard/admin/managers/new",
          icon: UserPlus,
        },
        {
          name: "Especialidades",
          href: "/dashboard/admin/specialties",
          icon: Stethoscope,
        },
        {
          name: "Questionário",
          href: "/dashboard/admin/questionnaires",
          icon: ClipboardList,
        },
      ];
    case "PROFESSIONAL":
      return [
        { name: "Início", href: "/dashboard/professional", icon: Home },
        {
          name: "Agenda",
          href: "/dashboard/professional/schedule",
          icon: Calendar,
        },
        {
          name: "Solicitações",
          href: "/dashboard/professional/requests",
          icon: ClockAlert,
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
        {
          name: "Perfil",
          href: "/dashboard/manager/profile",
          icon: User,
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
}
