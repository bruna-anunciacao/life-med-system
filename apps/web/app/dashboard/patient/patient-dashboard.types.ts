import { AppointmentResponse } from "@/services/appointments-service";
import { AdminUser } from "@/services/admin-service";

export type Professional = AdminUser;

export type StatItem = {
  title: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
};

export type DashboardData = {
  userName: string;
  appointments: AppointmentResponse[];
  professionals: Professional[];
};
