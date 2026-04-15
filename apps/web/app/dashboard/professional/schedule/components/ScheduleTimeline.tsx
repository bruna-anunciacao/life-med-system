import { Spinner } from "@/components/ui/spinner";
import { AppointmentCard } from "./AppointmentCard";

type Appointment = {
  id: string;
  dateTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  notes?: string;
  patient: { name: string };
};

type ScheduleTimelineProps = {
  isLoading: boolean;
  isAvailableToday: boolean;
  timeSlots: string[];
  getAppointmentForSlot: (slot: string) => Appointment | undefined;
  onStatusChange: (id: string, newStatus: string) => void;
};

export function ScheduleTimeline({
  isLoading,
  isAvailableToday,
  timeSlots,
  getAppointmentForSlot,
  onStatusChange,
}: ScheduleTimelineProps) {
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

  return (
    <>
      {timeSlots.map((slot) => {
        const appointment = getAppointmentForSlot(slot);
        return (
          <div key={slot} className="flex gap-6 min-h-[90px]">
            <div className="w-[60px] pt-4 font-mono font-semibold text-gray-400 text-right text-[0.9rem]">
              {slot}
            </div>
            <div className="flex-1 relative pb-4 border-b border-dashed border-gray-200 last:border-b-0">
              {appointment ? (
                <AppointmentCard
                  appointment={appointment}
                  slot={slot}
                  onStatusChange={onStatusChange}
                />
              ) : (
                <div className="h-full flex items-center justify-between px-4 rounded-xl border border-transparent transition-all duration-200 cursor-pointer bg-[#fafafa] hover:bg-gray-100 hover:border-gray-200">
                  <span className="text-gray-400 text-sm">Disponível</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
