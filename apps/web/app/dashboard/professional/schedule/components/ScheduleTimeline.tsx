import React, { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { AppointmentCard } from "./AppointmentCard";
import { isSameDay } from "date-fns";

type Appointment = {
  id: string;
  dateTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  notes?: string;
  patient: { name: string };
};

type ScheduleBlock = {
  id: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
};

type ScheduleTimelineProps = {
  isLoading: boolean;
  isAvailableToday: boolean;
  timeSlots: string[];
  scheduleBlocks?: ScheduleBlock[];
  selectedDate: Date | undefined;
  getAppointmentForSlot: (slot: string) => Appointment | undefined;
  onStatusChange: (id: string, newStatus: string, notes?: string) => void;
  isReadOnly?: boolean;
};

export function ScheduleTimeline({
  isLoading,
  isAvailableToday,
  timeSlots,
  scheduleBlocks = [],
  selectedDate,
  getAppointmentForSlot,
  onStatusChange,
  isReadOnly = false,
}: ScheduleTimelineProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAvailableToday) {
    return (
      <div className="text-center py-10 text-gray-500">
        Você não possui expediente configurado para este dia da semana.
      </div>
    );
  }

  const renderCurrentTimeLine = (startMins: number, span: number = 1) => {
    if (!selectedDate || !isSameDay(now, selectedDate)) return null;

    const nowMins = now.getHours() * 60 + now.getMinutes();
    if (nowMins >= startMins && nowMins < startMins + span * 30) {
      const topOffset = 26 + (nowMins - startMins) * 3;

      return (
        <div
          className="absolute -left-3 right-0 flex items-center z-50 pointer-events-none"
          style={{ top: `${topOffset}px` }}
          title="Horário atual"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-sm" />
          <div className="flex-1 h-0.5 bg-blue-600 shadow-sm opacity-80" />
        </div>
      );
    }
    return null;
  };

  const isSlotBlocked = (slot: string) => {
    return scheduleBlocks.some((block) => {
      if (!block.startTime || !block.endTime) return true; // Dia inteiro
      return slot >= block.startTime && slot < block.endTime;
    });
  };

  const timelineRows = [];

  for (let i = 0; i < timeSlots.length; i++) {
    const slot = timeSlots[i];
    if (!slot) continue;

    const appointment = getAppointmentForSlot(slot);
    const slotMins =
      parseInt(slot.split(":")[0] || "0") * 60 +
      parseInt(slot.split(":")[1] || "0");

    if (appointment) {
      let span = 1;

      for (let j = i + 1; j < timeSlots.length; j++) {
        const nextSlot = timeSlots[j];
        if (!nextSlot) break;

        if (getAppointmentForSlot(nextSlot)?.id === appointment.id) {
          span++;
        } else {
          break;
        }
      }

      const spannedSlots = timeSlots.slice(i, i + span);

      timelineRows.push(
        <div key={slot} className="flex gap-6 relative">
          <div className="w-15 flex flex-col">
            {spannedSlots.map((spannedSlot) => (
              <div
                key={spannedSlot}
                className="h-22.5 pt-4 font-mono font-semibold text-gray-400 text-right text-[0.9rem]"
                title={`Horário: ${spannedSlot}`}
              >
                {spannedSlot}
              </div>
            ))}
          </div>

          <div className="flex-1 relative pb-4 border-b border-dashed border-gray-200 last:border-b-0">
            {renderCurrentTimeLine(slotMins, span)}
            <div className="h-full w-full">
              <AppointmentCard
                appointment={appointment}
                slot={slot}
                onStatusChange={onStatusChange}
                isReadOnly={isReadOnly}
              />
            </div>
          </div>
        </div>,
      );

      i += span - 1;
    } else {
      const blocked = isSlotBlocked(slot);

      timelineRows.push(
        <div key={slot} className="flex gap-6 relative">
          <div
            className="w-15 h-22.5 pt-4 font-mono font-semibold text-gray-400 text-right text-[0.9rem]"
            title={`Horário: ${slot}`}
          >
            {slot}
          </div>
          <div className="flex-1 relative pb-4 border-b border-dashed border-gray-200 last:border-b-0">
            {renderCurrentTimeLine(slotMins, 1)}
            <div
              className={`h-full flex items-center justify-between px-4 rounded-xl border transition-all duration-200 cursor-pointer ${blocked ? 'bg-red-50 border-red-100 cursor-not-allowed' : 'bg-[#fafafa] border-transparent hover:bg-gray-100 hover:border-gray-200'}`}
              title={`Horário das ${slot} está ${blocked ? 'Cancelado / Bloqueado' : 'Disponível'} na sua agenda`}
            >
              <span className={`text-sm ${blocked ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                {blocked ? 'Cancelado / Bloqueado' : 'Disponível'}
              </span>
            </div>
          </div>
        </div>,
      );
    }
  }

  return <>{timelineRows}</>;
}
