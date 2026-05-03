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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`${isMobile ? "w-full max-w-full" : "max-w-2xl"} p-0 overflow-hidden`}>
        {/* Header com gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Stethoscope size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{professional.name}</h2>
              {professional.professionalProfile?.specialty && (
                <p className="text-blue-100 text-sm">
                  {professional.professionalProfile.specialty}
                </p>
              )}
            </div>
          </div>
          <p className="text-blue-50">Preencha os dados para agendar uma consulta</p>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Step 1: Patient Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                  1
                </div>
              </div>
              <Label className="text-base font-semibold text-gray-900">
                Selecione o Paciente
              </Label>
            </div>

            {selectedPatientData ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedPatientData.name || selectedPatientData.email}
                    </p>
                    <p className="text-xs text-gray-500">{selectedPatientData.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedPatient("");
                    setPatientSearchTerm("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={patientSearchTerm}
                    onChange={(e) => {
                      setPatientSearchTerm(e.target.value);
                      setShowPatientDropdown(true);
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                    className="pl-10 w-full border-gray-300 focus:ring-blue-500"
                  />
                </div>

                {showPatientDropdown && patientSearchTerm && filteredPatients.length > 0 && (
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
                        <div className="font-medium text-gray-900">
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
          </div>

          {selectedPatient && (
            <>
              {/* Step 2: Date Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                      2
                    </div>
                  </div>
                  <Label className="text-base font-semibold text-gray-900">
                    Escolha a Data
                  </Label>
                </div>

                <div className="relative">
                  <CalendarDots
                    size={18}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <Input
                    type="date"
                    min={today}
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="pl-10 w-full border-gray-300 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Step 3: Time Selection */}
              {selectedDate && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                        3
                      </div>
                    </div>
                    <Label className="text-base font-semibold text-gray-900">
                      Selecione o Horário
                    </Label>
                  </div>

                  {isLoadingSlots ? (
                    <div className="flex justify-center py-8">
                      <Spinner size="lg" />
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`p-3 rounded-lg text-sm font-semibold transition-all border-2 ${
                            selectedSlot === slot.time
                              ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                              : "bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                          }`}
                        >
                          <Clock size={14} className="mx-auto mb-1" />
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Nenhum horário disponível nesta data</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Notes */}
              {selectedSlot && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-gray-600 font-semibold text-sm">
                        4
                      </div>
                    </div>
                    <Label className="text-base font-semibold text-gray-900">
                      Observações (Opcional)
                    </Label>
                  </div>

                  <textarea
                    placeholder="Adicione qualquer observação relevante para a consulta..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                    rows={3}
                  />
                </div>
              )}
            </>
          )}

          {/* Summary */}
          {isFormComplete && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <p className="font-semibold text-gray-900 text-sm">Resumo da Consulta</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Paciente</p>
                  <p className="font-medium text-gray-900">
                    {selectedPatientData?.name || selectedPatientData?.email}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Profissional</p>
                  <p className="font-medium text-gray-900">{professional.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Data</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Horário</p>
                  <p className="font-medium text-gray-900">{selectedSlot}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-gray-300"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormComplete || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Agendando...
              </>
            ) : (
              <>
                <CheckCircle size={18} className="mr-2" />
                Agendar Consulta
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
