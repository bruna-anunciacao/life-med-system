import { AppointmentResponse } from "@/services/appointments-service";
import { ProfessionalUser } from "@/services/professionals-service";

export type Professional = ProfessionalUser;

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
