import { AppointmentResponse } from "@/services/appointments-service";

export type Professional = {
  id: string;
  name: string;
  professionalProfile?: {
    specialty?: string;
  } | null;
};

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
