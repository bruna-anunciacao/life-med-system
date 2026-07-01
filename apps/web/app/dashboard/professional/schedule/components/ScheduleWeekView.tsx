import React from "react";
import { Spinner } from "@/components/ui/spinner";
import { format, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AppointmentResponse } from "@/services/appointments-service";
import { STATUS_DOT_CLASS } from "../../components/appointment-meta";

type Appointment = AppointmentResponse;

type ScheduleBlock = {
  id: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
};

type ScheduleWeekViewProps = {
  isLoading: boolean;
  weekDays: Date[];
  appointments: Appointment[];
  scheduleBlocks: ScheduleBlock[];
  onSelectDay: (day: Date) => void;
};

export function ScheduleWeekView({
  isLoading,
  weekDays,
  appointments,
  scheduleBlocks,
  onSelectDay,
}: ScheduleWeekViewProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  const getAppointmentsForDay = (day: Date) =>
    appointments
      .filter((apt) => isSameDay(new Date(apt.dateTime), day))
      .sort(
        (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      );

  const isDayBlocked = (day: Date) =>
    scheduleBlocks.some((block) => isSameDay(new Date(`${block.date}T00:00:00`), day));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
      {weekDays.map((day) => {
        const dayAppointments = getAppointmentsForDay(day);
        const blocked = isDayBlocked(day);

        return (
          <button
            key={day.toISOString()}
            type="button"
            onClick={() => onSelectDay(day)}
            title={`Ver agenda de ${format(day, "dd/MM")}`}
            className={`text-left rounded-xl border p-3 min-h-[140px] md:min-h-[160px] flex flex-col gap-2 transition-colors hover:border-gray-300 hover:bg-gray-50 ${
              isToday(day)
                ? "border-[#006fee] bg-blue-50/30"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 capitalize">
                {format(day, "EEE, d MMM", { locale: ptBR })}
              </span>
              {blocked && (
                <span
                  className="text-[10px] font-semibold text-red-500"
                  title="Agenda bloqueada neste dia"
                >
                  Bloqueado
                </span>
              )}
            </div>

            {dayAppointments.length === 0 ? (
              <span className="text-xs text-gray-400">Sem consultas</span>
            ) : (
              <div className="flex flex-col gap-1.5">
                {dayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-1.5 text-xs text-gray-600"
                    title={`${apt.patient.name} às ${format(new Date(apt.dateTime), "HH:mm")}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT_CLASS[apt.status] ?? "bg-gray-300"}`}
                    />
                    <span className="font-mono shrink-0">
                      {format(new Date(apt.dateTime), "HH:mm")}
                    </span>
                    <span className="truncate">{apt.patient.name}</span>
                  </div>
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
