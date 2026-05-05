import { Card, CardContent } from "@/components/ui/card";
import { AppointmentResponse } from "@/services/appointments-service";
import { formatShortDate } from "../patient-dashboard.utils";

type RecentHistoryListProps = {
  appointments: AppointmentResponse[];
  onViewAll: () => void;
};

export function RecentHistoryList({
  appointments,
  onViewAll,
}: RecentHistoryListProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">
          Histórico Recente
        </h2>
        <button
          onClick={onViewAll}
          title="Ver todo o histórico de consultas realizadas"
          className="text-xs font-medium text-blue-500 hover:text-blue-600"
        >
          Ver histórico
        </button>
      </div>
      <Card className="border border-gray-200 py-0 gap-0">
        <CardContent className="p-0">
          {appointments.length === 0 ? (
            <div
              className="px-4 py-6 text-center text-sm text-gray-400"
              title="Você ainda não possui consultas no seu histórico"
            >
              Nenhuma consulta realizada ainda.
            </div>
          ) : (
            appointments.map((appt, i) => (
              <div
                key={appt.id}
                title={`Consulta com ${appt.professional.name} realizada em ${formatShortDate(appt.dateTime)}`}
                className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 ${i < appointments.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <p className="min-w-0 flex-1 truncate text-sm text-gray-600">
                  {appt.professional.name}
                </p>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatShortDate(appt.dateTime)}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
