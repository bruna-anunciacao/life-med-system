"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DayPicker } from "react-day-picker";
import { addDays, endOfWeek, format, isSameDay, startOfWeek, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useDailyScheduleQuery } from "@/queries/useDailyScheduleQuery";
import {
  useProfessionalAppointmentsQuery,
  useScheduleBlocksQuery,
  useUpdateAppointmentStatusMutation,
} from "@/queries/useProfessionalAppointments";
import { ScheduleTimeline } from "./components/ScheduleTimeline";
import { ScheduleWeekView } from "./components/ScheduleWeekView";
import ScheduleModal from "./scheduleModal";
import { BlockScheduleModal } from "./components/BlockScheduleModal";
import { PageShell, PageHeader } from "../../../ui/dashboard/page-shell";
import { TourButton } from "@/components/tour/TourButton";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import type { AppointmentResponse } from "@/services/appointments-service";

type Appointment = AppointmentResponse;

const SchedulePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const {
    data: scheduleData,
    isLoading,
    isError,
  } = useDailyScheduleQuery(dateStr);

  const weekStart = selectedDate
    ? startOfWeek(selectedDate, { locale: ptBR })
    : undefined;
  const weekEnd = selectedDate
    ? endOfWeek(selectedDate, { locale: ptBR })
    : undefined;
  const weekDays = useMemo(
    () =>
      weekStart ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)) : [],
    [weekStart],
  );

  const {
    data: weekData,
    isLoading: isWeekLoading,
    isError: isWeekError,
  } = useProfessionalAppointmentsQuery(
    {
      startDate: weekStart ? format(weekStart, "yyyy-MM-dd") : undefined,
      endDate: weekEnd ? format(weekEnd, "yyyy-MM-dd") : undefined,
      // A API limita "limit" a 100 registros (ver list-appointments-query.dto.ts).
      // Para uma janela de 7 dias, 100 consultas é uma folga confortável mesmo
      // em agendas muito cheias; se algum dia isso não bastar, paginar aqui.
      limit: 100,
    },
    { enabled: viewMode === "week" && Boolean(weekStart && weekEnd) },
  );

  const { data: allScheduleBlocks } = useScheduleBlocksQuery();

  const { mutate: updateStatus } = useUpdateAppointmentStatusMutation();

  useEffect(() => {
    if (isError) toast.error("Erro ao carregar a agenda do dia.");
  }, [isError]);

  useEffect(() => {
    if (isWeekError) toast.error("Erro ao carregar a agenda da semana.");
  }, [isWeekError]);

  const handlePrevDay = () => {
    setSelectedDate((current) => subDays(current ?? new Date(), 1));
  };

  const handleNextDay = () => {
    setSelectedDate((current) => addDays(current ?? new Date(), 1));
  };

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
          <div className="flex flex-col gap-4 mb-6 pb-4 border-b border-gray-100">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
              <div className="flex items-center gap-2 min-w-0">
                {viewMode === "day" && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      title="Dia anterior"
                      onClick={handlePrevDay}
                    >
                      <CaretLeft size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      title="Próximo dia"
                      onClick={handleNextDay}
                    >
                      <CaretRight size={16} />
                    </Button>
                  </div>
                )}
                <h2 className="text-base sm:text-xl font-semibold text-gray-700 capitalize truncate">
                  {viewMode === "day"
                    ? selectedDate &&
                      format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })
                    : weekStart &&
                      weekEnd &&
                      `${format(weekStart, "d MMM", { locale: ptBR })} – ${format(weekEnd, "d MMM", { locale: ptBR })}`}
                </h2>
              </div>
              {viewMode === "day" && isAvailableToday && (
                <Badge
                  className="py-1 px-4 w-fit"
                  title="Você tem horários configurados para atendimento neste dia"
                >
                  Dia de Atendimento
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "day" ? "default" : "outline"}
                size="sm"
                title="Visualizar agenda por dia"
                onClick={() => setViewMode("day")}
              >
                Diária
              </Button>
              <Button
                variant={viewMode === "week" ? "default" : "outline"}
                size="sm"
                title="Visualizar agenda por semana"
                onClick={() => setViewMode("week")}
              >
                Semanal
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {viewMode === "day" ? (
              <ScheduleTimeline
                isLoading={isLoading}
                isAvailableToday={isAvailableToday}
                timeSlots={timeSlots}
                scheduleBlocks={scheduleBlocks}
                getAppointmentForSlot={getAppointmentForSlot}
                onStatusChange={handleStatusChange}
                selectedDate={selectedDate}
              />
            ) : (
              <ScheduleWeekView
                isLoading={isWeekLoading}
                weekDays={weekDays}
                appointments={(weekData?.data || []) as Appointment[]}
                scheduleBlocks={allScheduleBlocks || []}
                onSelectDay={(day) => {
                  setSelectedDate(day);
                  setViewMode("day");
                }}
              />
            )}
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
