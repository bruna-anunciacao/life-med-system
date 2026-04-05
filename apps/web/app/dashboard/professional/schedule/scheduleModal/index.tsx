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
import { Separator } from "@/components/ui/separator";
import { useProfessionalSettingsQuery } from "../../../../../queries/useProfessionalSettingsQuery";
import { useScheduleModalForm } from "./useScheduleModalForm";

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

const ScheduleModal = ({ isOpen, onOpenChange }: ScheduleModalProps) => {
  const [localAvailability, setLocalAvailability] = useState(defaultAvailability);
  const [localPayments, setLocalPayments] = useState<string[]>(["pix"]);
  const [priceDisplay, setPriceDisplay] = useState("");

  const closeModal = () => onOpenChange(false);

  const { form, onSubmit, isLoading: isSaving } = useScheduleModalForm(closeModal);
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = form;

  const currentModality = watch("modality");

  const { data: settingsData, isLoading: isLoadingData } = useProfessionalSettingsQuery({ enabled: isOpen });

  useEffect(() => {
    if (settingsData && isOpen) {
      const initialPayments = settingsData.payments?.length ? settingsData.payments : ["pix"];
      const numericPrice = Number(settingsData.price) || 0;

      const mergedAvailability = defaultAvailability.map((day) => {
        const match = settingsData.availability?.find(
          (a: { dayOfWeek: number; start: string; end: string }) => a.dayOfWeek === day.id
        );
        return match ? { ...day, active: true, start: match.start, end: match.end } : { ...day, active: false };
      });

      reset({
        modality: settingsData.modality ?? "VIRTUAL",
        address: settingsData.address ?? "",
        price: numericPrice,
        payments: initialPayments,
        availability: mergedAvailability
          .filter((d) => d.active)
          .map((d) => ({ dayOfWeek: d.id, start: d.start, end: d.end })),
      });

      setLocalPayments(initialPayments);
      setLocalAvailability(mergedAvailability);
      setPriceDisplay(numericPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
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
    const filtered = avail.filter((d) => d.active).map((d) => ({ dayOfWeek: d.id, start: d.start, end: d.end }));
    setValue("availability", filtered, { shouldValidate: true });
  };

  const handleToggleDay = (id: number) => {
    setLocalAvailability((prev) => {
      const next = prev.map((day) => day.id === id ? { ...day, active: !day.active } : day);
      updateFormAvailability(next);
      return next;
    });
  };

  const handleTimeChange = (id: number, field: "start" | "end", value: string) => {
    setLocalAvailability((prev) => {
      const next = prev.map((day) => day.id === id ? { ...day, [field]: value } : day);
      updateFormAvailability(next);
      return next;
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const numeric = Number(value) / 100;
    setPriceDisplay(numeric.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="w-full max-w-[850px] p-6 flex flex-col overflow-auto rounded-2xl bg-white text-black">
          <DialogHeader className="flex flex-col items-center text-center mb-4">
            <h2 className="text-2xl font-semibold">Gerenciar Atendimento</h2>
            <p className="text-sm text-gray-500 mt-1">
              Defina sua disponibilidade e informações de consulta.
            </p>
          </DialogHeader>

          <div className="gap-6 pb-6">
            {isLoadingData ? (
              <div className="flex justify-center items-center py-10">
                <Spinner size="lg" />
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Detalhes da Consulta</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-[0.35rem] w-full">
                      <label htmlFor="modality">Modalidade de atendimento</label>
                      <select
                        id="modality"
                        className="w-full h-[42px] px-3 rounded-lg border border-gray-300 text-[0.9rem] transition-colors duration-200 focus:outline-none focus:border-blue-600"
                        {...register("modality")}
                      >
                        <option value="VIRTUAL">Virtual</option>
                        <option value="HOME_VISIT">Domiciliar</option>
                        <option value="CLINIC">Clínica</option>
                      </select>
                      {errors.modality && (
                        <span className="text-red-500 text-xs mt-1">{errors.modality.message}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-[0.35rem] w-full">
                      <label htmlFor="price">Valor da Consulta</label>
                      <input
                        type="text"
                        id="price"
                        placeholder="R$ 0,00"
                        value={priceDisplay}
                        onChange={handlePriceChange}
                        className="w-full h-[42px] px-3 rounded-lg border border-gray-300 text-[0.9rem] transition-colors duration-200 focus:outline-none focus:border-blue-600"
                      />
                      {errors.price ? (
                        <span className="text-red-500 text-xs mt-1">{errors.price.message}</span>
                      ) : (
                        <span className="pl-4 text-xs text-red-600">* Pagamentos externos ao sistema.</span>
                      )}
                    </div>
                    {currentModality === "CLINIC" && (
                      <div className="flex flex-col gap-[0.35rem] w-full col-span-1 md:col-span-2">
                        <label htmlFor="address">Endereço da Clínica</label>
                        <input
                          type="text"
                          id="address"
                          placeholder="Ex: Rua das Flores, 123 - Sala 4"
                          className="w-full h-[42px] px-3 rounded-lg border border-gray-300 text-[0.9rem] transition-colors duration-200 focus:outline-none focus:border-blue-600"
                          {...register("address")}
                        />
                        {errors.address && (
                          <span className="text-red-500 text-xs mt-1">{errors.address.message}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="w-1/2 flex flex-col gap-[0.6rem]">
                  <label className="text-lg font-semibold mb-2">Métodos de pagamento aceitos</label>
                  {errors.payments && (
                    <span className="text-red-500 text-xs mb-2 block">{errors.payments.message}</span>
                  )}
                  <div className="flex flex-wrap gap-4 mt-2">
                    {paymentMethods.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 text-[0.9rem] cursor-pointer">
                        <input
                          type="checkbox"
                          value={option.value}
                          checked={localPayments.includes(option.value)}
                          onChange={(e) => handleTogglePayment(option.value, e.target.checked)}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <h3 className="text-lg font-semibold mb-2">Horários de Disponibilidade</h3>
                  <p className="text-[0.85rem] text-[#8a91a0] mb-4">
                    Selecione os dias da semana e a janela de horário que você atende.
                  </p>
                  {errors.availability && (
                    <span className="text-red-500 text-xs mb-2 block">{errors.availability.message}</span>
                  )}
                  <div className="flex flex-col gap-4 mt-4">
                    {localAvailability.map((day) => (
                      <div key={day.id} className="w-full px-2 flex justify-between gap-4 bg-gray-100 rounded-lg">
                        <div className="flex items-center gap-3 w-40">
                          <label className="flex gap-2">
                            <input
                              type="checkbox"
                              checked={day.active}
                              onChange={() => handleToggleDay(day.id)}
                            />
                            <span></span>
                            <span className={`text-sm transition-colors duration-200 ${day.active ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                              {day.label}
                            </span>
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={day.start}
                            disabled={!day.active}
                            onChange={(e) => handleTimeChange(day.id, "start", e.target.value)}
                            className="w-28"
                          />
                          <span className="text-gray-400">até</span>
                          <Input
                            type="time"
                            value={day.end}
                            disabled={!day.active}
                            onChange={(e) => handleTimeChange(day.id, "end", e.target.value)}
                            className="w-28"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="flex justify-end gap-3 mt-4">
            <Button
              variant="destructive"
              size="lg"
              onClick={closeModal}
              disabled={isSaving || isLoadingData}
            >
              Cancelar
            </Button>
            <Button
              size="lg"
              onClick={() => handleSubmit(onSubmit)()}
              disabled={isSaving || isLoadingData}
            >
              {isSaving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleModal;
