"use client";

import { type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RegisterFormData } from "../register-validation";

type ProfessionalFieldsProps = {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
};

export function ProfessionalFields({
  register,
  errors,
}: ProfessionalFieldsProps) {
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      value = value.slice(0, 14);
    }
    e.target.value = value;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
        <div className="w-full flex flex-col gap-1">
          <Label htmlFor="cpf" className="text-sm font-medium text-[#334155]">
            CPF
          </Label>
          <Input
            id="cpf"
            placeholder="000.000.000-00"
            type="text"
            maxLength={14}
            className="h-12 px-4 py-3 rounded-lg border border-[#cbd5e1] text-sm text-[#334155] bg-white outline-none transition-all focus:border-[#2563eb] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.1)]"
            {...register("cpf", { onChange: handleCpfChange })}
          />
          {errors.cpf && (
            <p className="text-sm text-destructive">{errors.cpf.message}</p>
          )}
        </div>
        <div className="w-full flex flex-col gap-1">
          <Label
            htmlFor="professionalLicense"
            className="text-sm font-medium text-[#334155]"
          >
            Registro profissional (CRM/CRP)
          </Label>
          <Input
            id="professionalLicense"
            placeholder="Ex: 123456-SP"
            className="h-12 px-4 py-3 rounded-lg border border-[#cbd5e1] text-sm text-[#334155] bg-white outline-none transition-all focus:border-[#2563eb] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.1)]"
            {...register("professionalLicense")}
          />
          {errors.professionalLicense && (
            <p className="text-sm text-destructive">
              {errors.professionalLicense.message}
            </p>
          )}
        </div>
        <div className="w-full flex flex-col gap-1">
          <Label
            htmlFor="specialty"
            className="text-sm font-medium text-[#334155]"
          >
            Especialidade
          </Label>
          <Input
            id="specialty"
            placeholder="Ex: Cardiologia"
            className="h-12 px-4 py-3 rounded-lg border border-[#cbd5e1] text-sm text-[#334155] bg-white outline-none transition-all focus:border-[#2563eb] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.1)]"
            {...register("specialty")}
          />
          {errors.specialty && (
            <p className="text-sm text-destructive">
              {errors.specialty.message}
            </p>
          )}
        </div>

        <div className="w-full flex flex-col gap-1">
          <Label
            htmlFor="subspecialty"
            className="text-sm font-medium text-[#334155]"
          >
            Subespecialidade
          </Label>
          <Input
            id="subspecialty"
            placeholder="Ex: Cardiologia infantil"
            className="h-12 px-4 py-3 rounded-lg border border-[#cbd5e1] text-sm text-[#334155] bg-white outline-none transition-all focus:border-[#2563eb] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.1)]"
            {...register("subspecialty")}
          />
          {errors.subspecialty && (
            <p className="text-sm text-destructive">
              {errors.subspecialty.message}
            </p>
          )}
        </div>

        <div className="w-full flex flex-col gap-1">
          <Label
            htmlFor="modality"
            className="text-sm font-medium text-[#334155]"
          >
            Modalidade de atendimento
          </Label>
          <select
            id="modality"
            className="h-12 px-4 py-3 rounded-lg border border-[#cbd5e1] text-sm text-[#334155] bg-white outline-none transition-all focus:border-[#2563eb] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.1)]"
            {...register("modality")}
          >
            <option value="" disabled>
              Selecione
            </option>
            <option value="VIRTUAL">Virtual</option>
            <option value="HOME_VISIT">Domiciliar</option>
            <option value="CLINIC">Clínica</option>
          </select>
          {errors.modality && (
            <p className="text-sm text-destructive">
              {errors.modality.message}
            </p>
          )}
        </div>
      </div>

      <div className="w-full flex flex-col gap-1">
        <Label htmlFor="bio" className="text-sm font-medium text-[#334155]">
          Biografia
        </Label>
        <textarea
          id="bio"
          placeholder="Ex: Sou um profissional de saúde com 10 anos de experiência"
          className="w-full px-4 py-3 rounded-lg border border-[#cbd5e1] transition-all bg-white text-sm text-[#334155] outline-none resize-none focus:border-[#2563eb] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.1)]"
          rows={4}
          {...register("bio")}
        />
        {errors.bio && (
          <p className="text-sm text-destructive">{errors.bio.message}</p>
        )}
      </div>

      <div className="w-full flex flex-col gap-1">
        <Label
          htmlFor="referenceLink"
          className="text-sm font-medium text-[#334155]"
        >
          Link de referência (Linkedin/Lattes)
        </Label>
        <Input
          id="referenceLink"
          placeholder="Ex: https://..."
          type="url"
          className="h-12 px-4 py-3 rounded-lg border border-[#cbd5e1] text-sm text-[#334155] bg-white outline-none transition-all focus:border-[#2563eb] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.1)]"
          {...register("socialLinks.referenceLink")}
        />
        {errors.socialLinks && (
          <p className="text-sm text-destructive">
            {errors.socialLinks.message}
          </p>
        )}
      </div>
    </div>
  );
}
