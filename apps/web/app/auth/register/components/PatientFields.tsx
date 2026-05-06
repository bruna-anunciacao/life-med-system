"use client";

import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PhoneInput from "react-phone-number-input";
import ptBr from "react-phone-number-input/locale/pt-BR";
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
              <PhoneInput
                id="phone"
                placeholder="71 99999 9999"
                international
                countryCallingCodeEditable={false}
                labels={ptBr}
                title="Insira seu número de celular com DDD"
                aria-label="Telefone celular do paciente"
                className="w-full h-9 flex items-center border border-input rounded-md bg-white text-[#334155] overflow-hidden [&_.PhoneInputCountry]:max-w-[40%] [&_.PhoneInputCountry]:px-3 [&_.PhoneInputCountry]:flex [&_.PhoneInputCountry]:flex-row-reverse [&_.PhoneInputCountry]:items-center [&_.PhoneInputCountry]:justify-start [&_.PhoneInputCountry]:gap-1 [&_.PhoneInputCountry]:border-r [&_.PhoneInputCountry]:border-[#e2e8f0] [&_.PhoneInputCountrySelect]:max-w-[80%] [&_.PhoneInputCountryIcon]:w-5 [&_.PhoneInputCountryIcon]:h-[14px] [&_.PhoneInputCountryIcon]:flex [&_.PhoneInputCountryIcon]:justify-center [&_.PhoneInputCountryIcon]:items-center [&_.PhoneInputInput]:h-full [&_.PhoneInputInput]:px-4 [&_.PhoneInputInput]:flex-1 [&_.PhoneInputInput]:border-none [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:outline-none"
                value={field.value as string}
                onChange={field.onChange}
                disabled={isLoading}
                defaultCountry="BR"
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