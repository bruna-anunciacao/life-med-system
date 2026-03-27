import { Spinner } from "@/components/ui/spinner";
import { AppointmentCard } from "./AppointmentCard";
import styles from "../schedule.module.css";

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
};

export function ScheduleTimeline({
  isLoading,
  isAvailableToday,
  timeSlots,
  getAppointmentForSlot,
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
          <div key={slot} className={styles.timeRow}>
            <div className={styles.timeLabel}>{slot}</div>
            <div className={styles.slotContent}>
              {appointment ? (
                <AppointmentCard appointment={appointment} slot={slot} />
              ) : (
                <div className={styles.emptySlot}>
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
