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
} from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ManagerBookingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  patients: { id: string; name?: string; email: string }[];
  professional: {
    id: string;
    name: string;
    professionalProfile?: {
      specialty?: string;
    } | null;
  } | null;
}

const timeToMins = (time: string) => {
  const [h, m] = time.split(":");
  return parseInt(h || "0", 10) * 60 + parseInt(m || "0", 10);
};

export function ManagerBookingModal({
  isOpen,
  onOpenChange,
  onSuccess,
  patients,
  professional,
}: ManagerBookingModalProps) {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const filteredPatients = patients.filter((p) =>
    (p.name || p.email).toLowerCase().includes(patientSearchTerm.toLowerCase())
  );

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    setSelectedSlot("");
    setSlots([]);

    if (!date || !professional) return;

    setIsLoadingSlots(true);
    try {
      const result = await appointmentsService.getAvailableSlots(
        professional.id,
        date
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
    if (!professional || !selectedPatient || !selectedDate || !selectedSlot) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const dateTime = `${selectedDate}T${selectedSlot}:00`;

    setIsSubmitting(true);
    try {
      await appointmentsService.createForManager({
        patientId: selectedPatient,
        professionalId: professional.id,
        dateTime,
        notes: notes || undefined,
      });

      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
      void queryClient.invalidateQueries({ queryKey: ["my-appointments"] });

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
    setSelectedPatient("");
    setSelectedDate("");
    setSelectedSlot("");
    setNotes("");
    setSlots([]);
    setPatientSearchTerm("");
    onOpenChange(false);
  };

  if (!professional) return null;

  const APPOINTMENT_DURATION = 60;

  const bookedMins = slots
    .filter((s) => !s.available)
    .map((s) => timeToMins(s.time));

  const availableSlots = slots.filter((slot) => {
    if (!slot.available) return false;

    const slotMins = timeToMins(slot.time);
    for (const bookedMin of bookedMins) {
      if (
        slotMins < bookedMin + APPOINTMENT_DURATION &&
        slotMins + APPOINTMENT_DURATION > bookedMin
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`${isMobile ? "w-full" : "max-w-md"}`}>
        <DialogHeader>
          <h2 className="text-lg font-semibold">
            Agendar consulta para {professional.name}
          </h2>
          {professional.professionalProfile?.specialty && (
            <p className="text-sm text-gray-500">
              {professional.professionalProfile.specialty}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="patient-search">Paciente *</Label>
            <div className="relative">
              <Input
                id="patient-search"
                type="text"
                placeholder="Buscar paciente..."
                value={patientSearchTerm}
                onChange={(e) => setPatientSearchTerm(e.target.value)}
                className="w-full"
              />
              {patientSearchTerm && filteredPatients.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {filteredPatients.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPatient(p.id);
                        setPatientSearchTerm(p.name || p.email);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0 text-sm"
                    >
                      <div className="font-medium">{p.name || p.email}</div>
                      <div className="text-xs text-gray-500">{p.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedPatient && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Paciente selecionado
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="date-input" className="flex items-center gap-2">
              <CalendarDots size={16} />
              Data *
            </Label>
            <Input
              id="date-input"
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full"
            />
          </div>

          {selectedDate && (
            <div>
              <Label className="flex items-center gap-2">
                <Clock size={16} />
                Horário *
              </Label>
              {isLoadingSlots ? (
                <div className="flex justify-center py-4">
                  <Spinner size="sm" />
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`p-2 rounded-lg text-sm font-medium transition-all ${
                        selectedSlot === slot.time
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum horário disponível
                </p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="notes" className="flex items-center gap-2">
              <NotePencil size={16} />
              Observações
            </Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações sobre a consulta..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedPatient || !selectedDate || !selectedSlot || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Agendando...
              </>
            ) : (
              "Agendar Consulta"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
