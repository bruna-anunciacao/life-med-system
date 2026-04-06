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
  const canCancel =
    (appt.status === "CONFIRMED" || appt.status === "PENDING") &&
    new Date(appt.dateTime).getTime() - Date.now() > 24 * 60 * 60 * 1000;

  return (
    <Card className={`border border-gray-200 rounded-xl bg-white transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] ${statusBorderMap[appt.status] ?? ""} ${getCardStatusClass(appt.status)}`}>
      <CardContent className="p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:gap-5 sm:items-center">
        <div className="flex gap-4 sm:gap-5 flex-1 items-center">
          <div className="w-14 sm:w-16 p-2 flex flex-col items-center border border-gray-200 rounded-xl bg-gray-50 flex-shrink-0">
            <span className="text-xl sm:text-2xl font-bold text-[#006fee] leading-none">{day}</span>
            <span className="text-[0.65rem] sm:text-[0.7rem] font-semibold text-gray-500 uppercase mt-0.5">{month}</span>
            <span className="text-[0.6rem] sm:text-[0.65rem] text-gray-400">{year}</span>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900">{appt.doctorName}</h3>
            <p className="text-xs sm:text-sm text-gray-500">{appt.specialty}</p>
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
        </div>
        <div className="flex flex-row gap-2 justify-end sm:flex-col sm:justify-start sm:flex-shrink-0">
          {(appt.status === "CONFIRMED" || appt.status === "PENDING") && (
            <>
              <Button size="sm" className="px-3 sm:px-4 py-1.5 rounded-lg bg-[#006fee] font-semibold text-xs text-white cursor-pointer transition-all duration-200 hover:bg-[#0056b3]">Detalhes</Button>
              {canCancel ? (
                <Button size="sm" className="px-3 sm:px-4 py-1.5 border border-red-200 rounded-lg bg-white font-semibold text-xs text-red-500 cursor-pointer transition-all duration-200 hover:bg-red-50" onClick={() => onCancel(appt.id)}>Cancelar</Button>
              ) : (
                <span className="px-2 py-1.5 text-xs text-gray-400 text-center leading-tight">Cancelamento indisponível<br/>(menos de 24h)</span>
              )}
            </>
          )}
          {appt.status === "COMPLETED" && (
            <Button size="sm" className="px-3 sm:px-4 py-1.5 rounded-lg bg-[#006fee] font-semibold text-xs text-white cursor-pointer transition-all duration-200 hover:bg-[#0056b3]">Ver Detalhes</Button>
          )}
          {appt.status === "CANCELLED" && (
            <Button size="sm" className="px-3 sm:px-4 py-1.5 border border-gray-200 rounded-lg bg-white font-semibold text-xs text-gray-700 cursor-pointer transition-all duration-200 hover:bg-gray-50" onClick={onRebook}>
              Reagendar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
