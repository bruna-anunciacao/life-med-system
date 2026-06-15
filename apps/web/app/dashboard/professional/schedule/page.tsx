"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DayPicker } from "react-day-picker";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useDailyScheduleQuery } from "@/queries/useDailyScheduleQuery";
import { useUpdateAppointmentStatusMutation } from "@/queries/useProfessionalAppointments";
import { ScheduleTimeline } from "./components/ScheduleTimeline";
import ScheduleModal from "./scheduleModal";
import { BlockScheduleModal } from "./components/BlockScheduleModal";
import { PageShell, PageHeader } from "../../../ui/dashboard/page-shell";
import { TourButton } from "@/components/tour/TourButton";

type Appointment = {
  id: string;
  dateTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  notes?: string;
  patient: { name: string };
};

const SchedulePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const {
    data: scheduleData,
    isLoading,
    isError,
  } = useDailyScheduleQuery(dateStr);

  const { mutate: updateStatus } = useUpdateAppointmentStatusMutation();

  useEffect(() => {
    if (isError) toast.error("Erro ao carregar a agenda do dia.");
  }, [isError]);

  const { appointments, timeSlots, isAvailableToday, scheduleBlocks } = useMemo(() => {
    if (!scheduleData)
      return {
        appointments: [] as Appointment[],
        timeSlots: [] as string[],
        isAvailableToday: true,
        scheduleBlocks: [],
      };  
  
    const appts = scheduleData.appointments as Appointment[];
    const blocks = scheduleData.scheduleBlocks || [];

    if (!scheduleData.availability)
      return {
        appointments: appts,
        timeSlots: [] as string[],
        isAvailableToday: false,
        scheduleBlocks: blocks,
      };

    const toMinutes = (time: string) => {
      const [h, m] = time.split(":");
      return parseInt(h || "0", 10) * 60 + parseInt(m || "0", 10);
    };

    const startMinutes = toMinutes(scheduleData.availability.startTime);
    const endMinutes = toMinutes(scheduleData.availability.endTime);

    // Gera slots de 30 em 30 min, alinhados na hora/meia-hora, cobrindo
    // qualquer horário com início dentro da janela de disponibilidade.
    const slots: string[] = [];
    const firstSlot = Math.floor(startMinutes / 30) * 30;
    for (let m = firstSlot; m < endMinutes; m += 30) {
      const hourStr = Math.floor(m / 60)
        .toString()
        .padStart(2, "0");
      const minStr = (m % 60).toString().padStart(2, "0");
      slots.push(`${hourStr}:${minStr}`);
    }

    return { appointments: appts, timeSlots: slots, isAvailableToday: true, scheduleBlocks: blocks };
  }, [scheduleData]);

  const getAppointmentForSlot = (slotTime: string) => {
    if (!selectedDate) return undefined;

    const [slotHourStr, slotMinuteStr] = slotTime.split(":");
    const slotTotalMinutes =
      parseInt(slotHourStr || "0", 10) * 60 +
      parseInt(slotMinuteStr || "0", 10);

    // Cada slot cobre uma janela de 30 min; a consulta aparece no slot cujo
    // intervalo contém o horário de início dela (assim consultas em horários
    // "quebrados" como 23:40 também são exibidas, no slot 23:30).
    const overlappingApts = appointments.filter((apt) => {
      const aptDate = new Date(apt.dateTime);

      if (!isSameDay(aptDate, selectedDate)) return false;

      const aptStartMinutes = aptDate.getHours() * 60 + aptDate.getMinutes();

      return (
        aptStartMinutes >= slotTotalMinutes &&
        aptStartMinutes < slotTotalMinutes + 30
      );
    });

    if (overlappingApts.length === 0) return undefined;

    const activeApt = overlappingApts.find((apt) => apt.status !== "CANCELLED");

    return activeApt || overlappingApts[0];
  };

  const handleStatusChange = (
    id: string,
    newStatus: string,
    notes?: string,
  ) => {
    updateStatus({ id, status: newStatus, notes });
  };

  return (
    <PageShell>
      <PageHeader
        title="Minha Agenda"
        description="Visualize e gerencie seus horários."
        help={<TourButton tour="professional-schedule" />}
        actions={
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button id="tour-prof-sched-cancel" variant="outline" title="Cancelar a agenda do dia" size="lg" onClick={() => setIsBlockModalOpen(true)} className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
              Cancelar Agenda
            </Button>
            <Button
              id="tour-prof-sched-manage"
              size="lg"
              onClick={() => setIsOpen(true)}
              className="w-full sm:w-auto"
              title="Configurar horários e dias de atendimento"
            >
              Gerenciar Horários
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] lg:items-start gap-6">
        <aside className="flex flex-col gap-6">
          <div
            id="tour-prof-sched-calendar"
            className="border border-gray-200 shadow-sm bg-white rounded-[20px] p-4 overflow-x-auto"
            title="Selecione um dia para visualizar a agenda"
          >
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
            />
          </div>
        </aside>

        <main id="tour-prof-sched-timeline" className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 min-h-[400px] sm:min-h-[600px] shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-base sm:text-xl font-semibold text-gray-700 capitalize">
              {selectedDate &&
                format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h2>
            {isAvailableToday && (
              <Badge
                className="py-1 px-4 w-fit"
                title="Você tem horários configurados para atendimento neste dia"
              >
                Dia de Atendimento
              </Badge>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <ScheduleTimeline
              isLoading={isLoading}
              isAvailableToday={isAvailableToday}
              timeSlots={timeSlots}
              scheduleBlocks={scheduleBlocks}
              getAppointmentForSlot={getAppointmentForSlot}
              onStatusChange={handleStatusChange}
              selectedDate={selectedDate}
            />
          </div>
        </main>
      </div>

      <ScheduleModal isOpen={isOpen} onOpenChange={(open) => setIsOpen(open)} />
      <BlockScheduleModal 
        isOpen={isBlockModalOpen} 
        onOpenChange={setIsBlockModalOpen}
        selectedDate={selectedDate}
      />
    </PageShell>
  );
};

export default SchedulePage;
