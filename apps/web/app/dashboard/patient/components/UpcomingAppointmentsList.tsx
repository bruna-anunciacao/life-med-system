import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentResponse } from "@/services/appointments-service";
import { ClockIcon } from "../../../utils/icons";
import { formatDay, formatMonth, formatTime } from "../patient-dashboard.utils";

const MAX_VISIBLE = 5;

const DEFAULT_BADGE = {
  className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  label: "Pendente",
};

const STATUS_BADGE: Record<string, { className: string; label: string }> = {
  CONFIRMED: {
    className: "bg-green-100 text-green-700 hover:bg-green-100",
    label: "Confirmada",
  },
  PENDING: {
    className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
    label: "Pendente",
  },
};

type UpcomingAppointmentsListProps = {
  appointments: AppointmentResponse[];
  onViewAll: () => void;
};

export function UpcomingAppointmentsList({
  appointments,
  onViewAll,
}: UpcomingAppointmentsListProps) {
  const visible = appointments.slice(0, MAX_VISIBLE);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">
          Próximas Consultas
        </h2>
        <button
          onClick={onViewAll}
          className="text-xs font-medium text-blue-500 hover:text-blue-600"
        >
          Ver todas
        </button>
      </div>
      <Card className="border border-gray-200 py-0 gap-0">
        <CardContent className="p-0">
          {visible.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              Nenhuma consulta próxima.
            </div>
          ) : (
            visible.map((appt, i) => {
              const badge = STATUS_BADGE[appt.status] ?? DEFAULT_BADGE;
              return (
                <div
                  key={appt.id}
                  className={`grid grid-cols-[48px_1fr_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50 ${i < visible.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  <div className="flex flex-col items-center justify-center rounded-lg bg-blue-50 py-2">
                    <span className="text-base font-bold leading-none text-blue-500">
                      {formatDay(appt.dateTime)}
                    </span>
                    <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-blue-400">
                      {formatMonth(appt.dateTime)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {appt.professional.name}
                    </p>
                    <span className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                      <ClockIcon size={11} />
                      {formatTime(appt.dateTime)}
                    </span>
                  </div>
                  <Badge
                    className={`h-5 shrink-0 px-2 text-xs ${badge.className}`}
                  >
                    {badge.label}
                  </Badge>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
