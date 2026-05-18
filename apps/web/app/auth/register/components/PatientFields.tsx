"use client";

import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInputBR } from "@/components/ui/phone-input-br";
import type { RegisterFormData } from "../register-validation";

type PatientFieldsProps = {
  register: UseFormRegister<RegisterFormData>;
  control: Control<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  isLoading: boolean;
  onCpfChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function PatientFields({ register, control, errors, isLoading, onCpfChange }: PatientFieldsProps) {
  return (
    <>
      {/* CPF + Celular */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cpf" className="text-sm font-semibold text-[#374151]">CPF</Label>
          <Input
            id="cpf"
            placeholder="000.000.000-00"
            type="text"
            maxLength={14}
            title="Insira seu CPF (apenas números)"
            aria-label="CPF do paciente"
            {...register("cpf", { onChange: onCpfChange })}
          />
          {errors.cpf && <p className="text-xs font-medium text-[#dc2626]">{errors.cpf.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone" className="text-sm font-semibold text-[#374151]">Celular</Label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneInputBR
                id="phone"
                value={field.value as string}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                disabled={isLoading}
              />
            )}
          />
          {errors.phone && <p className="text-xs font-medium text-[#dc2626]">{errors.phone.message}</p>}
        </div>
      </div>

      {/* Data de nascimento + Gênero */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-[#374151]">Data de nascimento</Label>
          <input
            id="dateOfBirth"
            type="date"
            title="Sua data de nascimento"
            aria-label="Data de nascimento do paciente"
            className="h-9 px-3 py-1 rounded-md border border-input text-sm text-[#334155] bg-white outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
            {...register("dateOfBirth")}
          />
          {errors.dateOfBirth && (
            <p className="text-xs font-medium text-[#dc2626]">{errors.dateOfBirth.message as string}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="gender" className="text-sm font-semibold text-[#374151]">Gênero</Label>
          <select
            id="gender"
            title="Selecione seu gênero"
            aria-label="Gênero do paciente"
            className="h-9 px-3 py-1 rounded-md border border-input text-sm text-[#334155] bg-white outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
            {...register("gender")}
          >
            <option value="" disabled>Selecione</option>
            <option value="MALE">Masculino</option>
            <option value="FEMALE">Feminino</option>
            <option value="OTHER">Outro</option>
            <option value="UNDISCLOSED">Prefiro não informar</option>
          </select>
          {errors.gender && <p className="text-xs font-medium text-[#dc2626]">{errors.gender.message}</p>}
        </div>
      </div>
    </>
  );
}