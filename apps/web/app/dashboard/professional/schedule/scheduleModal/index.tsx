"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { useProfessionalSettingsQuery } from "@/queries/useProfessionalAppointments";
import { useScheduleModalForm } from "./useScheduleModalForm";
import AddressSection from "./AddressSection";

interface ScheduleModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const defaultAvailability = [
  { id: 1, label: "Segunda-feira", active: true, start: "08:00", end: "18:00" },
  { id: 2, label: "Terça-feira", active: true, start: "08:00", end: "18:00" },
  { id: 3, label: "Quarta-feira", active: true, start: "08:00", end: "18:00" },
  { id: 4, label: "Quinta-feira", active: true, start: "08:00", end: "18:00" },
  { id: 5, label: "Sexta-feira", active: true, start: "08:00", end: "18:00" },
  { id: 6, label: "Sábado", active: false, start: "08:00", end: "12:00" },
  { id: 0, label: "Domingo", active: false, start: "08:00", end: "12:00" },
];

const paymentMethods = [
  { value: "pix", label: "Pix" },
  { value: "credit_card", label: "Cartão de Crédito" },
  { value: "cash", label: "Dinheiro" },
  { value: "free", label: "Gratuito" },
];

type SectionLabelProps = { title: string; description?: string };

const SectionLabel = ({ title, description }: SectionLabelProps) => (
  <div className="mb-3">
    <h3 className="text-sm font-semibold text-gray-800 tracking-wide uppercase">
      {title}
    </h3>
    {description && (
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    )}
  </div>
);

type ModalityCardProps = {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  title?: string;
};

const ModalityCard = ({
  label,
  description,
  selected,
  onClick,
  title,
}: ModalityCardProps) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={cn(
      "flex flex-col gap-1 p-4 rounded-lg border-2 text-left w-full transition-colors duration-150 cursor-pointer",
      selected
        ? "border-gray-900 bg-gray-50"
        : "border-gray-200 bg-white hover:border-gray-300",
    )}
  >
    <span
      className={cn(
        "text-sm font-semibold",
        selected ? "text-gray-900" : "text-gray-700",
      )}
    >
      {label}
    </span>
    <span
      className={cn(
        "text-xs leading-tight",
        selected ? "text-gray-600" : "text-gray-400",
      )}
    >
      {description}
    </span>
  </button>
);

type PaymentChipProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
  title?: string;
};

const PaymentChip = ({ label, selected, onClick, title }: PaymentChipProps) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={cn(
      "px-4 py-2 rounded-md border text-sm font-medium transition-colors duration-150 cursor-pointer",
      selected
        ? "border-gray-900 bg-gray-900 text-white"
        : "border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-800",
    )}
  >
    {label}
  </button>
);

type ToggleSwitchProps = {
  checked: boolean;
  onChange: () => void;
  title?: string;
};

const ToggleSwitch = ({ checked, onChange, title }: ToggleSwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    title={title}
    className={cn(
      "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2",
      checked ? "bg-gray-900" : "bg-gray-200",
    )}
  >
    <span
      className={cn(
        "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-150",
        checked ? "translate-x-4" : "translate-x-0",
      )}
    />
  </button>
);

const ScheduleModal = ({ isOpen, onOpenChange }: ScheduleModalProps) => {
  const [localAvailability, setLocalAvailability] =
    useState(defaultAvailability);
  const [localPayments, setLocalPayments] = useState<string[]>(["pix"]);
  const [priceDisplay, setPriceDisplay] = useState("");
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const closeModal = () => onOpenChange(false);

  const {
    form,
    onSubmit,
    isLoading: isSaving,
  } = useScheduleModalForm(closeModal);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = form;

  const currentModality = watch("modality");

  const { data: settingsData, isLoading: isLoadingData } =
    useProfessionalSettingsQuery({ enabled: isOpen });

  useEffect(() => {
    if (settingsData && isOpen) {
      const initialPayments = settingsData.payments?.length
        ? settingsData.payments
        : ["pix"];
      const numericPrice = Number(settingsData.price) || 0;

      const mergedAvailability = defaultAvailability.map((day) => {
        const match = settingsData.availability?.find(
          (a: { dayOfWeek: number; start: string; end: string }) =>
            a.dayOfWeek === day.id,
        );
        return match
          ? { ...day, active: true, start: match.start, end: match.end }
          : { ...day, active: false };
      });

      reset({
        modality: settingsData.modality ?? "VIRTUAL",
        price: numericPrice,
        payments: initialPayments,
        availability: mergedAvailability
          .filter((d) => d.active)
          .map((d) => ({ dayOfWeek: d.id, start: d.start, end: d.end })),
      });

      setLocalPayments(initialPayments);
      setLocalAvailability(mergedAvailability);
      setPriceDisplay(
        numericPrice.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
      );
    }
  }, [settingsData, isOpen, reset]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      setLocalAvailability(defaultAvailability);
      setLocalPayments(["pix"]);
      setPriceDisplay("");
    }
  }, [isOpen, reset]);

  const updateFormAvailability = (avail: typeof defaultAvailability) => {
    const filtered = avail
      .filter((d) => d.active)
      .map((d) => ({ dayOfWeek: d.id, start: d.start, end: d.end }));
    setValue("availability", filtered, { shouldValidate: true });
  };

  const handleToggleDay = (id: number) => {
    setLocalAvailability((prev) => {
      const next = prev.map((day) =>
        day.id === id ? { ...day, active: !day.active } : day,
      );
      updateFormAvailability(next);
      return next;
    });
  };

  const handleTimeChange = (
    id: number,
    field: "start" | "end",
    value: string,
  ) => {
    setLocalAvailability((prev) => {
      const next = prev.map((day) =>
        day.id === id ? { ...day, [field]: value } : day,
      );
      updateFormAvailability(next);
      return next;
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const numeric = Number(value) / 100;
    setPriceDisplay(
      numeric.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    );
    setValue("price", numeric, { shouldValidate: true });
  };

  const handleTogglePayment = (value: string, checked: boolean) => {
    setLocalPayments((prev) => {
      const next = checked ? [...prev, value] : prev.filter((p) => p !== value);
      setValue("payments", next, { shouldValidate: true });
      return next;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full max-h-[92vh] overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Gerenciar Atendimento
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Defina sua disponibilidade e informações de consulta.
          </p>
        </DialogHeader>

        <div className="px-6 py-5">
          {isLoadingData ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Spinner size="lg" />
              <p className="text-sm text-gray-400">
                Carregando configurações...
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div>
                <SectionLabel title="Detalhes da Consulta" />
                <input type="hidden" {...register("modality")} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ModalityCard
                    label="Virtual"
                    description="Atendimento por videochamada"
                    selected={currentModality === "VIRTUAL"}
                    onClick={() =>
                      setValue("modality", "VIRTUAL", { shouldValidate: true })
                    }
                    title="Configurar atendimento online"
                  />
                  <ModalityCard
                    label="Domiciliar"
                    description="Atendimento na residência do paciente"
                    selected={currentModality === "HOME_VISIT"}
                    onClick={() =>
                      setValue("modality", "HOME_VISIT", {
                        shouldValidate: true,
                      })
                    }
                    title="Configurar atendimento a domicílio"
                  />
                  <ModalityCard
                    label="Clínica"
                    description="Atendimento em consultório físico"
                    selected={currentModality === "CLINIC"}
                    onClick={() =>
                      setValue("modality", "CLINIC", { shouldValidate: true })
                    }
                    title="Configurar atendimento presencial em clínica"
                  />
                </div>
                {errors.modality && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.modality.message}
                  </p>
                )}

                {/* Endereço da Clínica */}
                <div className="mt-6">
                  <AddressSection
                    isOpen={isOpen}
                    currentModality={currentModality}
                    isEditing={isEditingAddress}
                    onEditingChange={setIsEditingAddress}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="price"
                      className="text-xs font-medium text-gray-600"
                    >
                      Valor da Consulta
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none select-none">
                        R$
                      </span>
                      <input
                        type="text"
                        id="price"
                        placeholder="0,00"
                        title="Valor cobrado por consulta em Reais"
                        value={priceDisplay.replace(/^R\$\s*/, "")}
                        onChange={handlePriceChange}
                        className="w-full h-9 pl-9 pr-3 rounded-md border border-gray-200 text-sm transition-colors focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                      />
                    </div>
                    {errors.price ? (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.price.message}
                      </p>
                    ) : (
                      <p className="text-xs text-amber-700 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Pagamentos externos ao sistema.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              <div>
                <SectionLabel title="Métodos de Pagamento Aceitos" />
                {errors.payments && (
                  <p className="text-xs text-red-500 mb-3 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.payments.message}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map((option) => {
                    const isSelected = localPayments.includes(option.value);
                    return (
                      <PaymentChip
                        key={option.value}
                        label={option.label}
                        selected={isSelected}
                        title={
                          isSelected
                            ? `Remover pagamento via ${option.label}`
                            : `Aceitar pagamento via ${option.label}`
                        }
                        onClick={() =>
                          handleTogglePayment(option.value, !isSelected)
                        }
                      />
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-gray-100" />

              <div>
                <SectionLabel
                  title="Horários de Disponibilidade"
                  description="Selecione os dias da semana e a janela de horário que você atende."
                />
                {errors.availability && (
                  <p className="text-xs text-red-500 mb-3 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.availability.message}
                  </p>
                )}
                <div className="flex flex-col gap-1.5">
                  {localAvailability.map((day) => (
                    <div
                      key={day.id}
                      className={cn(
                        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 px-3 py-2.5 rounded-md border transition-colors duration-150",
                        day.active
                          ? "border-gray-200 bg-white"
                          : "border-gray-100 bg-gray-50",
                      )}
                    >

                      <div className="flex items-center gap-3 min-w-[160px]">
                        <ToggleSwitch
                          checked={day.active}
                          onChange={() => handleToggleDay(day.id)}
                          title={
                            day.active
                              ? `Desativar atendimentos na ${day.label}`
                              : `Ativar atendimentos na ${day.label}`
                          }
                        />
                        <span
                          className={cn(
                            "text-sm font-medium transition-colors duration-150",
                            day.active ? "text-gray-900" : "text-gray-400",
                          )}
                        >
                          {day.label}
                        </span>
                      </div>

                      <div
                        className={cn(
                          "flex items-center gap-2 w-full sm:w-auto transition-opacity duration-150",
                          !day.active && "opacity-40 pointer-events-none",
                        )}
                      >
                        <Input
                          type="time"
                          value={day.start}
                          disabled={!day.active}
                          title={`Horário de início dos atendimentos na ${day.label}`}
                          onChange={(e) =>
                            handleTimeChange(day.id, "start", e.target.value)
                          }
                          className="h-8 text-sm w-full sm:w-[110px]"
                        />
                        <span className="text-gray-300 text-sm flex-shrink-0">
                          —
                        </span>
                        <Input
                          type="time"
                          value={day.end}
                          disabled={!day.active}
                          title={`Horário de término dos atendimentos na ${day.label}`}
                          onChange={(e) =>
                            handleTimeChange(day.id, "end", e.target.value)
                          }
                          className="h-8 text-sm w-full sm:w-[110px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 px-6 py-4 border-t border-gray-100 bg-white rounded-b-xl sticky bottom-0">
          <Button
            variant="outline"
            size="lg"
            onClick={closeModal}
            disabled={isSaving || isLoadingData || isEditingAddress}
            title="Descartar alterações e fechar janela"
          >
            Cancelar
          </Button>
          <Button
            size="lg"
            onClick={() => handleSubmit(onSubmit)()}
            disabled={isSaving || isLoadingData || isEditingAddress}
            title="Salvar todas as configurações da agenda"
            className="min-w-[160px]"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Salvando...
              </span>
            ) : (
              "Salvar Configurações"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleModal;
