import { Badge } from "@/components/ui/badge";
import type { AppointmentModality } from "@/services/appointments-service";
import { MODALITY_META } from "./appointment-meta";

type ModalityBadgeProps = {
  modality?: AppointmentModality;
};

export function ModalityBadge({ modality }: ModalityBadgeProps) {
  const meta = modality ? MODALITY_META[modality] : MODALITY_META.VIRTUAL;
  return (
    <Badge className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
      {meta.icon}
      {meta.label}
    </Badge>
  );
}
