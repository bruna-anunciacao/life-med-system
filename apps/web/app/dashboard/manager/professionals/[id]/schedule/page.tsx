'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { DayPicker } from 'react-day-picker';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import Link from 'next/link';
import { useDailyScheduleQuery } from '@/queries/useDailyScheduleQuery';
import { ScheduleTimeline } from '@/app/dashboard/professional/schedule/components/ScheduleTimeline';
import { LoadingPage } from '@/components/shared/LoadingPage';
import { PageShell, PageHeader } from '../../../../../ui/dashboard/page-shell';

type Appointment = {
  id: string;
  dateTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  notes?: string;
  patient: { name: string };
};

export default function ProfessionalSchedulePage() {
  const params = useParams();
  const professionalId = params.id as string;

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  // Fetch schedule for the specific professional
  const { data: scheduleData, isLoading, isError } = useDailyScheduleQuery(
    dateStr,
    professionalId,
  );

  useEffect(() => {
    if (isError) toast.error('Erro ao carregar a agenda do profissional.');
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

    const startHour = parseInt(
      scheduleData.availability.startTime.split(':')[0],
      10,
    );
    const endHour = parseInt(scheduleData.availability.endTime.split(':')[0], 10);

    const slots: string[] = [];
    for (let i = startHour; i < endHour; i++) {
      const hourStr = i.toString().padStart(2, '0');
      slots.push(`${hourStr}:00`);
      slots.push(`${hourStr}:30`);
    }

    return {
      appointments: appts,
      timeSlots: slots,
      isAvailableToday: true,
      scheduleBlocks: blocks,
    };
  }, [scheduleData]);

  const getAppointmentForSlot = (slotTime: string) => {
    if (!selectedDate) return undefined;

    const [slotHourStr, slotMinuteStr] = slotTime.split(':');
    const slotTotalMinutes =
      parseInt(slotHourStr || '0', 10) * 60 + parseInt(slotMinuteStr || '0', 10);

    const overlappingApts = appointments.filter((apt) => {
      const aptDate = new Date(apt.dateTime);

      if (!isSameDay(aptDate, selectedDate)) return false;

      const aptTotalMinutes = aptDate.getHours() * 60 + aptDate.getMinutes();
      const aptEndMinutes = aptTotalMinutes + 60;

      return slotTotalMinutes >= aptTotalMinutes && slotTotalMinutes < aptEndMinutes;
    });

    if (overlappingApts.length === 0) return undefined;

    const activeApt = overlappingApts.find((apt) => apt.status !== 'CANCELLED');

    return activeApt || overlappingApts[0];
  };

  if (isLoading) {
    return <LoadingPage message="Carregando agenda do profissional..." />;
  }

  return (
    <PageShell>
      <Link href="/dashboard/manager/appointments" className="text-blue-600 hover:underline text-sm mb-2 block">
        ← Voltar para consultas
      </Link>
      <PageHeader
        title="Agenda do Profissional"
        description="Visualize os horários e consultas agendadas."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] lg:items-start gap-6">
        <aside className="flex flex-col gap-6">
          <div className="border border-gray-200 shadow-sm bg-white rounded-[20px] p-4 overflow-x-auto">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
            />
          </div>
        </aside>

        <main className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 min-h-[400px] sm:min-h-[600px] shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-base sm:text-xl font-semibold text-gray-700 capitalize">
              {selectedDate &&
                format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h2>
            {isAvailableToday && (
              <Badge className="py-1 px-4 w-fit">Dia de Atendimento</Badge>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <ScheduleTimeline
              isLoading={isLoading}
              isAvailableToday={isAvailableToday}
              timeSlots={timeSlots}
              scheduleBlocks={scheduleBlocks}
              getAppointmentForSlot={getAppointmentForSlot}
              onStatusChange={() => {}}
              selectedDate={selectedDate}
              isReadOnly={true}
            />
          </div>
        </main>
      </div>
    </PageShell>
  );
}
