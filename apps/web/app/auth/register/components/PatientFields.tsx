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
      <div className="w-full flex flex-col gap-1">
        <Label htmlFor="cpf" className="text-sm font-medium text-[#334155]">CPF</Label>
        <Input
          id="cpf"
          placeholder="000.000.000-00"
          type="text"
          className="h-12 px-4 py-3 rounded-lg border border-[#cbd5e1] text-sm text-[#334155] bg-white outline-none transition-all focus:border-[#2563eb] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.1)]"
          maxLength={14}
          {...register("cpf", { onChange: onCpfChange })}
        />
        {errors.cpf && <p className="text-sm text-destructive">{errors.cpf.message}</p>}
      </div>

      <div className="w-full flex flex-col gap-1">
        <Label htmlFor="phone" className="text-sm font-medium text-[#334155]">Celular</Label>
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
              className="w-full h-12 flex items-center border border-[#cbd5e1] rounded-lg bg-white text-[#334155] overflow-hidden [&_.PhoneInputCountry]:max-w-[40%] [&_.PhoneInputCountry]:px-3 [&_.PhoneInputCountry]:flex [&_.PhoneInputCountry]:flex-row-reverse [&_.PhoneInputCountry]:items-center [&_.PhoneInputCountry]:justify-start [&_.PhoneInputCountry]:gap-1 [&_.PhoneInputCountry]:border-r [&_.PhoneInputCountry]:border-[#e2e8f0] [&_.PhoneInputCountrySelect]:max-w-[80%] [&_.PhoneInputCountryIcon]:w-5 [&_.PhoneInputCountryIcon]:h-[14px] [&_.PhoneInputCountryIcon]:flex [&_.PhoneInputCountryIcon]:justify-center [&_.PhoneInputCountryIcon]:items-center [&_.PhoneInputInput]:h-full [&_.PhoneInputInput]:px-4 [&_.PhoneInputInput]:flex-1 [&_.PhoneInputInput]:border-none [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:outline-none"
              value={field.value as string}
              onChange={field.onChange}
              disabled={isLoading}
              defaultCountry="BR"
            />
          )}
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
        <div className="w-full flex flex-col gap-1">
          <Label htmlFor="dateOfBirth" className="text-sm font-medium text-[#334155]">Data de nascimento</Label>
          <input
            id="dateOfBirth"
            type="date"
            className="h-12 px-4 py-3 rounded-lg border border-[#cbd5e1] text-sm text-[#334155] bg-white outline-none transition-all focus:border-[#2563eb] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.1)]"
            {...register("dateOfBirth")}
          />
          {errors.dateOfBirth && (
            <p className="text-sm text-destructive">{errors.dateOfBirth.message as string}</p>
          )}
        </div>

        <div className="w-full flex flex-col gap-1">
          <Label htmlFor="gender" className="text-sm font-medium text-[#334155]">Gênero</Label>
          <select id="gender" className="h-12 px-4 py-3 rounded-lg border border-[#cbd5e1] text-sm text-[#334155] bg-white outline-none transition-all focus:border-[#2563eb] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.1)]" {...register("gender")}>
            <option value="" disabled>Selecione</option>
            <option value="MALE">Masculino</option>
            <option value="FEMALE">Feminino</option>
            <option value="OTHER">Outro</option>
            <option value="UNDISCLOSED">Prefiro não informar</option>
          </select>
          {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
        </div>
      </div>
    </>
  );
}
