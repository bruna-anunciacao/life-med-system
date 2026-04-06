"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAvailableSlotsQuery } from "@/queries/useAvailableSlotsQuery";
import { useCreateAppointmentMutation } from "@/queries/useCreateAppointmentMutation";

type BookingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professional: {
    id: string;
    name: string;
    specialty: string;
  };
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export function BookingDialog({ open, onOpenChange, professional }: BookingDialogProps) {
  const now = new Date();
  const todayStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  const { data: slots, isLoading: loadingSlots } = useAvailableSlotsQuery(
    professional.id,
    selectedDate,
  );

  const mutation = useCreateAppointmentMutation();

  const calendarCells = useMemo(() => {
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: Array<{ date: string; day: number } | null> = [];

    for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: toDateStr(viewYear, viewMonth, d), day: d });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const isPrevDisabled =
    viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const goToPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
    setSelectedDate("");
    setSelectedSlot("");
  };

  const goToNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
    setSelectedDate("");
    setSelectedSlot("");
  };

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot("");
  };

  const handleSlotClick = (slot: string) => {
    setSelectedSlot(slot === selectedSlot ? "" : slot);
  };

  const handleConfirm = () => {
    const dateTime = new Date(`${selectedDate}T${selectedSlot}:00.000Z`).toISOString();
    mutation.mutate(
      { professionalId: professional.id, dateTime, modality: "VIRTUAL" },
      {
        onSuccess: () => {
          toast.success("Consulta agendada com sucesso!");
          onOpenChange(false);
          reset();
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Erro ao agendar consulta.");
        },
      },
    );
  };

  const reset = () => {
    setSelectedDate("");
    setSelectedSlot("");
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) reset();
    onOpenChange(value);
  };

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-");
    return `${d} de ${MONTHS[parseInt(m, 10) - 1]}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agendar Consulta</DialogTitle>
          <DialogDescription>
            {professional.name} — {professional.specialty}
          </DialogDescription>
        </DialogHeader>

        {/* Calendar + Sidebar */}
        <div className="flex gap-0 -mx-4 border-t border-gray-100">

          {/* Calendar */}
          <div className="flex-1 p-5">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPrev}
                disabled={isPrevDisabled}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <CaretLeft size={15} weight="bold" />
              </button>
              <span className="text-sm font-semibold text-gray-800">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button
                onClick={goToNext}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <CaretRight size={15} weight="bold" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map((w) => (
                <div key={w} className="text-center text-xs font-medium text-gray-400 py-1">
                  {w}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-y-1">
              {calendarCells.map((cell, i) => {
                if (!cell) return <div key={`e-${i}`} />;

                const isPast = cell.date < todayStr;
                const isSelected = cell.date === selectedDate;
                const isToday = cell.date === todayStr;

                return (
                  <button
                    key={cell.date}
                    disabled={isPast}
                    onClick={() => handleDayClick(cell.date)}
                    className={[
                      "mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors",
                      isSelected
                        ? "bg-[#006fee] text-white"
                        : isToday
                          ? "border border-[#006fee] text-[#006fee] hover:bg-blue-50"
                          : isPast
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-700 hover:bg-blue-50",
                    ].join(" ")}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slots sidebar */}
          <div className="w-48 border-l border-gray-100 p-5 flex flex-col gap-3">
            {!selectedDate ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  Selecione um dia para ver os horários
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  {formatDate(selectedDate)}
                </p>
                {loadingSlots ? (
                  <div className="flex justify-center py-6">
                    <Spinner size="lg" />
                  </div>
                ) : !slots || slots.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center mt-2 leading-relaxed">
                    Nenhum horário disponível neste dia.
                  </p>
                ) : (
                  <div className="flex flex-col gap-1.5 overflow-y-auto max-h-52">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => handleSlotClick(slot)}
                        className={[
                          "w-full rounded-lg border px-3 py-2 text-sm font-medium transition-colors text-center",
                          selectedSlot === slot
                            ? "bg-[#006fee] text-white border-[#006fee]"
                            : "border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-[#006fee]",
                        ].join(" ")}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedSlot || mutation.isPending}
            className="bg-[#006fee] text-white hover:bg-[#0056b3] disabled:opacity-50"
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" /> Agendando...
              </span>
            ) : (
              "Confirmar Agendamento"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
