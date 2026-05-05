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
  User,
  Stethoscope,
  CheckCircle,
  Check,
  X,
} from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const filteredPatients = patients.filter((p) =>
    (p.name || p.email).toLowerCase().includes(patientSearchTerm.toLowerCase())
  );

  const selectedPatientData = patients.find((p) => p.id === selectedPatient);

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
    setShowPatientDropdown(false);
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

  const isFormComplete = selectedPatient && selectedDate && selectedSlot;

  // Progress steps logic (visual only, derived from existing state)
  const currentStep = !selectedPatient
    ? 1
    : !selectedDate
      ? 2
      : !selectedSlot
        ? 3
        : 4;

  const steps = [
    { id: 1, label: "Paciente" },
    { id: 2, label: "Data" },
    { id: 3, label: "Horário" },
    { id: 4, label: "Confirmação" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`${
          isMobile ? "w-[95vw]" : "w-[720px]"
        } !max-w-none p-0 overflow-hidden shadow-2xl rounded-xl max-h-[92vh] flex flex-col`}
      >
        {/* Header limpo */}
        <DialogHeader className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Stethoscope size={20} className="text-blue-600" weight="duotone" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {professional.name}
              </h2>
              {professional.professionalProfile?.specialty && (
                <p className="text-xs text-gray-500 truncate">
                  {professional.professionalProfile.specialty}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="px-6 pt-5 pb-4 bg-gray-50/60 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = step.id < currentStep;
              const isActive = step.id === currentStep;
              const isLast = index === steps.length - 1;

              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-semibold transition-all duration-300 ${
                        isCompleted
                          ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                          : isActive
                            ? "bg-blue-600 text-white shadow-md shadow-blue-200 ring-4 ring-blue-100"
                            : "bg-white text-gray-400 border border-gray-200"
                      }`}
                    >
                      {isCompleted ? <Check size={16} weight="bold" /> : step.id}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-medium whitespace-nowrap ${
                        isActive
                          ? "text-blue-600"
                          : isCompleted
                            ? "text-emerald-600"
                            : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className={`h-0.5 flex-1 mx-2 mb-5 rounded-full transition-colors duration-300 ${
                        isCompleted ? "bg-emerald-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content (scroll area) */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Step 1: Patient Selection */}
          <section className="space-y-2.5">
            <Label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <User size={16} className="text-blue-600" weight="duotone" />
              Selecione o Paciente
            </Label>

            {selectedPatientData ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 flex items-center justify-between group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={18} className="text-emerald-600" weight="fill" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {selectedPatientData.name || selectedPatientData.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {selectedPatientData.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedPatient("");
                    setPatientSearchTerm("");
                  }}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-white transition-colors flex-shrink-0"
                  aria-label="Remover paciente"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={patientSearchTerm}
                    onChange={(e) => {
                      setPatientSearchTerm(e.target.value);
                      setShowPatientDropdown(true);
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                    className="pl-10 w-full h-11 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {showPatientDropdown &&
                  patientSearchTerm &&
                  filteredPatients.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                      {filteredPatients.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedPatient(p.id);
                            setPatientSearchTerm("");
                            setShowPatientDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                        >
                          <div className="font-medium text-gray-900 text-sm">
                            {p.name || p.email}
                          </div>
                          <div className="text-xs text-gray-500">{p.email}</div>
                        </button>
                      ))}
                    </div>
                  )}

                {patientSearchTerm && filteredPatients.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
                    Nenhum paciente encontrado
                  </div>
                )}
              </div>
            )}
          </section>

          {selectedPatient && (
            <>
              {/* Step 2: Date Selection */}
              <section className="space-y-2.5">
                <Label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <CalendarDots size={16} className="text-blue-600" weight="duotone" />
                  Escolha a Data
                </Label>

                <div className="relative">
                  <CalendarDots
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <Input
                    type="date"
                    min={today}
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="pl-10 w-full h-11 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </section>

              {/* Step 3: Time Selection */}
              {selectedDate && (
                <section className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <Clock size={16} className="text-blue-600" weight="duotone" />
                      Selecione o Horário
                    </Label>
                    {availableSlots.length > 0 && !isLoadingSlots && (
                      <span className="text-xs text-gray-500">
                        {availableSlots.length}{" "}
                        {availableSlots.length === 1 ? "disponível" : "disponíveis"}
                      </span>
                    )}
                  </div>

                  {isLoadingSlots ? (
                    <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <Spinner size="lg" />
                      <p className="text-xs text-gray-500 mt-3">
                        Buscando horários disponíveis...
                      </p>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="relative">
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-56 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {availableSlots.map((slot) => {
                          const isSelected = selectedSlot === slot.time;
                          return (
                            <button
                              key={slot.time}
                              onClick={() => setSelectedSlot(slot.time)}
                              className={`py-3 px-2 rounded-lg text-sm font-semibold transition-all duration-150 border ${
                                isSelected
                                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 scale-[1.02]"
                                  : "bg-white text-gray-700 border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                              }`}
                              aria-pressed={isSelected}
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1.5 text-center">
                        Role para ver mais horários
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <Clock size={28} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">
                        Nenhum horário disponível nesta data
                      </p>
                    </div>
                  )}
                </section>
              )}

              {/* Step 4: Notes */}
              {selectedSlot && (
                <section className="space-y-2.5">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <NotePencil size={16} className="text-blue-600" weight="duotone" />
                    Observações
                    <span className="text-xs font-normal text-gray-400">(Opcional)</span>
                  </Label>

                  <textarea
                    placeholder="Adicione qualquer observação relevante para a consulta..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm placeholder:text-gray-400"
                    rows={3}
                  />
                </section>
              )}
            </>
          )}

          {/* Summary Card - médico ticket style */}
          {isFormComplete && (
            <div className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50/40 border border-blue-200 rounded-xl overflow-hidden shadow-sm">
              {/* Decorative side strip */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-700" />

              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed border-blue-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      size={16}
                      className="text-blue-600"
                      weight="fill"
                    />
                    <p className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                      Resumo da Consulta
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                    AGENDAMENTO
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User size={14} className="text-blue-600" weight="duotone" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                        Paciente
                      </p>
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {selectedPatientData?.name || selectedPatientData?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Stethoscope size={14} className="text-blue-600" weight="duotone" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                        Profissional
                      </p>
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {professional.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CalendarDots size={14} className="text-blue-600" weight="duotone" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                        Data
                      </p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {new Date(selectedDate).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock size={14} className="text-blue-600" weight="duotone" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                        Horário
                      </p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {selectedSlot}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="bg-white px-8 py-5 border-t border-gray-200 gap-3 sm:gap-4">
          <Button
            onClick={handleSubmit}
            disabled={!isFormComplete || isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Agendando...
              </>
            ) : (
              <>
                <CheckCircle size={18} className="mr-2" weight="fill" />
                Agendar Consulta
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
