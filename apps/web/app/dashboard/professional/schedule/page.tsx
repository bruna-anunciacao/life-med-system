"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DayPicker } from "react-day-picker";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import styles from "./schedule.module.css";
import { toast } from "sonner";
import { useDailyScheduleQuery } from "../../../../queries/useDailyScheduleQuery";
import { ScheduleTimeline } from "./components/ScheduleTimeline";
import ScheduleModal from "./scheduleModal";

type Appointment = {
  id: string;
  dateTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  notes?: string;
  patient: { name: string };
};

const SchedulePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const { data: scheduleData, isLoading, isError } = useDailyScheduleQuery(dateStr);

  useEffect(() => {
    if (isError) toast.error("Erro ao carregar a agenda do dia.");
  }, [isError]);

  const { appointments, timeSlots, isAvailableToday } = useMemo(() => {
    if (!scheduleData) return { appointments: [] as Appointment[], timeSlots: [] as string[], isAvailableToday: true };

    const appts = scheduleData.appointments as Appointment[];

    if (!scheduleData.availability) return { appointments: appts, timeSlots: [] as string[], isAvailableToday: false };

    const startHour = parseInt(scheduleData.availability.startTime.split(":")[0], 10);
    const endHour = parseInt(scheduleData.availability.endTime.split(":")[0], 10);
    const slots: string[] = [];
    for (let i = startHour; i < endHour; i++) {
      slots.push(`${i.toString().padStart(2, "0")}:00`);
    }

    return { appointments: appts, timeSlots: slots, isAvailableToday: true };
  }, [scheduleData]);

  const getAppointmentForSlot = (slotTime: string) => {
    if (!selectedDate) return undefined;
    return appointments.find((apt) => {
      const aptDate = new Date(apt.dateTime);
      return isSameDay(aptDate, selectedDate) &&
        aptDate.getUTCHours().toString().padStart(2, "0") + ":00" === slotTime;
    });
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Minha Agenda</h1>
          <p className={styles.subtitle}>Visualize e gerencie seus horários.</p>
        </div>
        <Button className={styles.addButton} onClick={() => setIsOpen(true)}>
          Gerenciar Horários
        </Button>
      </div>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebar}>
          <div className={styles.calendarCard}>
            <DayPicker mode="single" selected={selectedDate} onSelect={setSelectedDate} locale={ptBR} />
          </div>
        </aside>

        <main className={styles.timelineArea}>
          <div className={styles.dateHeader}>
            <h2 className={styles.currentDateTitle}>
              {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h2>
            {isAvailableToday && <Badge className={styles.dayOfAttendanceChip}>Dia de Atendimento</Badge>}
          </div>

          <div className={styles.timeline}>
            <ScheduleTimeline
              isLoading={isLoading}
              isAvailableToday={isAvailableToday}
              timeSlots={timeSlots}
              getAppointmentForSlot={getAppointmentForSlot}
            />
          </div>
        </main>
      </div>

      <ScheduleModal isOpen={isOpen} onOpenChange={(open) => setIsOpen(open)} />
    </section>
  );
};

export default SchedulePage;
