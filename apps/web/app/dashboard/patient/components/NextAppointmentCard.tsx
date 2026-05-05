import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentResponse } from "@/services/appointments-service";
import { CalendarIcon } from "../../../utils/icons";
import {
  getInitials,
  formatDateLabel,
  formatTimeRange,
} from "../patient-dashboard.utils";

type NextAppointmentCardProps = {
  appointment: AppointmentResponse | undefined;
  isMobile: boolean;
  onViewDetails: () => void;
  onBookNew: () => void;
};

export function NextAppointmentCard({
  appointment,
  isMobile,
  onViewDetails,
  onBookNew,
}: NextAppointmentCardProps) {
  if (!appointment) {
    return (
      <Card
        className="border border-gray-200 py-0 gap-0"
        title="Você não possui consultas futuras agendadas"
      >
        <CardContent className="flex flex-col items-center justify-center gap-3 p-6 text-center">
          <CalendarIcon size={32} className="text-gray-300" />
          <p className="text-sm text-gray-500">Nenhuma consulta agendada.</p>
          <Button
            size="sm"
            onClick={onBookNew}
            title="Buscar e agendar uma nova consulta"
          >
            Agendar Consulta
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 py-0 gap-0">
      <CardContent className="flex flex-col gap-4 p-6">
        <div
          className="flex items-center gap-2"
          title="Esta é a sua consulta mais próxima"
        >
          <span className="size-1.5 animate-pulse rounded-full bg-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.2)]" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Próxima consulta
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white"
            title={`Foto de perfil de ${appointment.professional.name}`}
          >
            {getInitials(appointment.professional.name)}
          </div>
          <div>
            <p
              className={`font-bold leading-tight text-gray-900 ${isMobile ? "text-lg" : "text-xl"}`}
              title={`Profissional: ${appointment.professional.name}`}
            >
              {appointment.professional.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-xl bg-slate-50 border border-gray-100 px-4 py-3"
            title={`Data da consulta: ${formatDateLabel(appointment.dateTime)}`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Data
            </p>
            <p className="mt-0.5 text-sm font-semibold text-gray-800">
              {formatDateLabel(appointment.dateTime)}
            </p>
          </div>
          <div
            className="rounded-xl bg-slate-50 border border-gray-100 px-4 py-3"
            title={`Horário da consulta: ${formatTimeRange(appointment.dateTime)}`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Horário
            </p>
            <p className="mt-0.5 text-sm font-semibold text-gray-800">
              {formatTimeRange(appointment.dateTime)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onViewDetails}
            title="Ver mais detalhes e gerenciar esta consulta"
          >
            Ver detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
