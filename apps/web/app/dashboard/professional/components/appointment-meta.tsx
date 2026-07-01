import type {
  AppointmentModality,
  AppointmentStatus,
} from "@/services/appointments-service";
import { VideoIcon, HouseIcon, BuildingsIcon } from "../../../utils/icons";

/**
 * Shared display metadata for appointment status/modality, reused across the
 * professional dashboard (home, requests list, schedule day/week views).
 * Keeping this centralized avoids each screen re-declaring its own label and
 * color maps that inevitably drift from one another.
 */

export const MODALITY_META: Record<
  AppointmentModality,
  { label: string; icon: React.ReactNode }
> = {
  VIRTUAL: { label: "Online", icon: <VideoIcon size={14} /> },
  HOME_VISIT: { label: "Domiciliar", icon: <HouseIcon size={14} /> },
  CLINIC: { label: "Presencial", icon: <BuildingsIcon size={14} /> },
};

// Full status metadata used by list/card style views (badge label + classes).
export const STATUS_META: Record<
  AppointmentStatus,
  { label: string; badgeClassName: string }
> = {
  PENDING: {
    label: "Pendente",
    badgeClassName: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  CONFIRMED: {
    label: "Confirmado",
    badgeClassName: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  COMPLETED: {
    label: "Atendido",
    badgeClassName: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  NO_SHOW: {
    label: "Faltou",
    badgeClassName: "bg-orange-50 text-orange-700 border border-orange-200",
  },
  CANCELLED: {
    label: "Cancelado",
    badgeClassName: "bg-red-50 text-red-600 border border-red-200",
  },
};

// Compact dot color used by the week view's summarized appointment rows.
export const STATUS_DOT_CLASS: Record<AppointmentStatus, string> = {
  PENDING: "bg-[#f5a524]",
  CONFIRMED: "bg-[#006fee]",
  COMPLETED: "bg-[#17c964]",
  NO_SHOW: "bg-orange-500",
  CANCELLED: "bg-red-400",
};
