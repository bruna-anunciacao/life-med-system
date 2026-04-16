"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useQueryClient } from "@tanstack/react-query";
import {
  appointmentsService,
  AppointmentSlot,
} from "@/services/appointments-service";
import {
  CalendarDots,
  Clock,
  NotePencil,
  CurrencyDollar,
} from "@phosphor-icons/react";

interface BookingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  pacienteId?: string;
  professional: {
    id: string;
    name: string;
    professionalProfile?: {
      specialty: string;
      price?: number | null;
    } | null;
  } | null;
}

export function BookingModal({
  isOpen,
  onOpenChange,
  onSuccess,
  pacienteId,
  professional,
}: BookingModalProps) {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    setSelectedSlot("");
    setSlots([]);

    if (!date || !professional) return;

    setIsLoadingSlots(true);
    try {
      const result = await appointmentsService.getAvailableSlots(
        professional.id,
        date,
      );
      if (result) {
        setSlots(result.slots);
        if (result.slots.length === 0) {
          toast.error("Nenhum horário disponível nesta data.");
        }
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Erro ao buscar horários.";
      toast.error(msg);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleSubmit = async () => {
    if (!professional || !selectedDate || !selectedSlot) return;

    const dateTime = `${selectedDate}T${selectedSlot}:00`;

    setIsSubmitting(true);
    try {
      if (pacienteId) {
        await appointmentsService.createForManager({
          patientId: pacienteId,
          professionalId: professional.id,
          dateTime,
          notes: notes || undefined,
        });
      } else {
        await appointmentsService.create({
          professionalId: professional.id,
          dateTime,
          notes: notes || undefined,
        });
      }

      void queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });

      toast.success("Consulta agendada com sucesso!");

      if (onSuccess) {
        onSuccess();
      } else {
        handleClose();
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Erro ao agendar consulta.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedDate("");
    setSelectedSlot("");
    setNotes("");
    setSlots([]);
    onOpenChange(false);
  };

  if (!professional) return null;

  const availableSlots = slots.filter((s) => s.available);
  const price = professional.professionalProfile?.price;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isMobile ? "max-w-[95vw]" : "sm:max-w-lg"}`}
      >
        <div
          className={`w-full flex flex-col overflow-auto rounded-2xl bg-white text-black mx-auto ${isMobile ? "p-4" : "p-6"}`}
        >
          <DialogHeader className="flex flex-col items-center text-center mb-4">
            <h2
              className={`font-semibold ${isMobile ? "text-xl" : "text-2xl"}`}
            >
              Agendar Consulta
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {professional.name} -{" "}
              {professional.professionalProfile?.specialty || "Especialidade"}
            </p>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <CalendarDots size={18} />
                Selecione a data
              </label>
              <input
                type="date"
                min={today}
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006fee] focus:border-transparent"
              />
            </div>

            {isLoadingSlots && (
              <div className="flex justify-center py-6">
                <Spinner size="md" />
              </div>
            )}

            {selectedDate && !isLoadingSlots && slots.length > 0 && (
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Clock size={18} />
                  Horários disponíveis
                </label>
                {availableSlots.length === 0 ? (
                  <p className="text-sm text-gray-500 italic py-2">
                    Todos os horários estão ocupados nesta data.
                  </p>
                ) : (
                  <div
                    className={`grid gap-2 ${isMobile ? "grid-cols-3" : "grid-cols-4"}`}
                  >
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all duration-150 cursor-pointer ${
                          selectedSlot === slot.time
                            ? "bg-[#006fee] text-white border-[#006fee] shadow-sm"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:border-[#006fee] hover:bg-blue-50"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <NotePencil size={18} />
                Observações (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                rows={isMobile ? 2 : 3}
                placeholder="Descreva o motivo da consulta ou dúvidas..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#006fee] focus:border-transparent"
              />
            </div>

            {price !== undefined && price !== null && (
              <div className="mt-2 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-900 font-medium text-sm">
                  <CurrencyDollar size={20} className="text-blue-600" />
                  Valor da consulta
                </div>
                <span className="font-bold text-blue-700 text-lg">
                  {price.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            )}
          </div>

          <DialogFooter
            className={`flex mt-4 ${isMobile ? "flex-col gap-2" : "flex-row justify-end gap-3"}`}
          >
            <Button
              variant="outline"
              onClick={handleClose}
              className={`rounded-lg font-semibold text-sm ${isMobile ? "w-full order-2" : ""}`}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedDate || !selectedSlot || isSubmitting}
              className={`rounded-lg font-semibold text-sm ${isMobile ? "w-full order-1" : ""}`}
            >
              {isSubmitting ? "Agendando..." : "Confirmar Agendamento"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
