'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface ProfessionalAvailabilityDisplayProps {
  availability: AvailabilitySlot[];
  isLoading?: boolean;
  className?: string;
}

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

const DAY_ABBREVIATIONS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

export function ProfessionalAvailabilityDisplay({
  availability,
  isLoading = false,
  className,
}: ProfessionalAvailabilityDisplayProps) {
  if (isLoading) {
    return (
      <Card className={cn('p-4', className)}>
        <div className="text-sm text-gray-500">Carregando disponibilidade...</div>
      </Card>
    );
  }

  if (!availability || availability.length === 0) {
    return (
      <Card className={cn('p-4', className)}>
        <div className="text-sm text-gray-500">Nenhuma disponibilidade cadastrada</div>
      </Card>
    );
  }

  // Ordenar slots por dia da semana
  const sortedAvailability = [...availability].sort(
    (a, b) => a.dayOfWeek - b.dayOfWeek
  );

  // Agrupar por dia da semana
  const availabilityByDay = sortedAvailability.reduce(
    (acc, slot) => {
      const slotArray = acc[slot.dayOfWeek];
      if (!acc[slot.dayOfWeek]) {
        acc[slot.dayOfWeek] = [];
      }
      if (slotArray) {
        slotArray.push({
          startTime: slot.startTime,
          endTime: slot.endTime,
        });
      }
      return acc;
    },
    {} as Record<number, Array<{ startTime: string; endTime: string }>>
  );

  return (
    <Card className={cn('p-4', className)}>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Disponibilidade
      </h3>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Object.entries(availabilityByDay).map(([dayOfWeekStr, slots]) => {
          const dayOfWeek = parseInt(dayOfWeekStr);
          return (
            <div
              key={dayOfWeek}
              className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="text-xs font-semibold text-blue-900 mb-2">
                {DAYS_OF_WEEK[dayOfWeek]}
              </div>
              <div className="space-y-1">
                {slots.map((slot, idx) => (
                  <div key={idx} className="text-xs text-blue-700">
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumo rápido */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-600">
          <span className="font-medium">Dias disponíveis:</span>{' '}
          {Object.keys(availabilityByDay)
            .map((day) => DAY_ABBREVIATIONS[parseInt(day)])
            .join(', ')}
        </div>
      </div>
    </Card>
  );
}

function formatTime(timeString: string): string {
  // Esperando formato "HH:mm:ss" ou "HH:mm"
  return timeString.substring(0, 5);
}
