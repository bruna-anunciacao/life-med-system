export type Appointment = {
  id: string;
  professionalId: string;
  doctorName: string;
  specialty: string;
  dateTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  modality: "VIRTUAL" | "CLINIC" | "HOME_VISIT";
  notes?: string;
};

export const TABS = [
  { key: "upcoming", label: "Próximas" },
  { key: "past", label: "Realizadas" },
  { key: "cancelled", label: "Canceladas" },
] as const;

export type TabKey = (typeof TABS)[number]["key"];
