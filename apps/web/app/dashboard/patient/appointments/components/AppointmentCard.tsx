import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ClockIcon } from "../../../../utils/icons";
import { Appointment } from "../appointments.types";
import {
  formatDate,
  formatTime,
  getStatusLabel,
  getStatusClass,
  getModalityLabel,
  getCardStatusClass,
} from "../appointments.utils";

type AppointmentCardProps = {
  appointment: Appointment;
  onCancel: (id: string) => void;
  onRebook: () => void;
};

const statusBorderMap: Record<string, string> = {
  CONFIRMED: "border-l-4 border-l-[#006fee]",
  COMPLETED: "border-l-4 border-l-[#17c964]",
  PENDING: "border-l-4 border-l-[#f5a524]",
  CANCELLED: "border-l-4 border-l-[#f31260]",
};

export function AppointmentCard({ appointment: appt, onCancel, onRebook }: AppointmentCardProps) {
  const { day, month, year } = formatDate(appt.dateTime);

  return (
    <Card className={`border border-gray-200 rounded-xl bg-white transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] ${statusBorderMap[appt.status] ?? ""} ${getCardStatusClass(appt.status)}`}>
      <CardContent className={`p-5 flex gap-5 items-center flex-row! items-center!`}>
        <div className="w-16 p-2 flex flex-col items-center border border-gray-200 rounded-xl bg-gray-50 flex-shrink-0">
          <span className="text-2xl font-bold text-[#006fee] leading-none">{day}</span>
          <span className="text-[0.7rem] font-semibold text-gray-500 uppercase mt-0.5">{month}</span>
          <span className="text-[0.65rem] text-gray-400">{year}</span>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <h3 className="text-base font-semibold text-gray-900">{appt.doctorName}</h3>
          <p className="text-sm text-gray-500">{appt.specialty}</p>
          <div className="mt-1 flex flex-wrap gap-2 items-center">
            <span className="flex items-center gap-1 text-xs font-medium text-gray-700"><ClockIcon /> {formatTime(appt.dateTime)}</span>
            <Badge className="px-2 py-0.5 rounded text-[0.7rem] font-semibold">{getModalityLabel(appt.modality)}</Badge>
            <Badge className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(appt.status)}`}>
              {getStatusLabel(appt.status)}
            </Badge>
          </div>
          {appt.notes && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs italic text-gray-400">Obs: {appt.notes}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          {(appt.status === "CONFIRMED" || appt.status === "PENDING") && (
            <>
              <Button size="sm">Detalhes</Button>
              <Button size="sm" variant="destructive" onClick={() => onCancel(appt.id)}>Cancelar</Button>
            </>
          )}
          {appt.status === "COMPLETED" && (
            <Button size="sm">Ver Detalhes</Button>
          )}
          {appt.status === "CANCELLED" && (
            <Button size="sm" variant="outline" onClick={onRebook}>
              Reagendar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
