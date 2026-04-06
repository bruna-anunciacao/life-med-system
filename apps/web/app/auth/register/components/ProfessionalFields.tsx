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
    <div className="flex flex-col gap-3">
      {/* CPF + Registro profissional */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cpf" className="text-sm font-semibold text-[#374151]">CPF</Label>
          <Input
            id="cpf"
            placeholder="000.000.000-00"
            type="text"
            maxLength={14}
            {...register("cpf", { onChange: handleCpfChange })}
          />
          {errors.cpf && <p className="text-xs font-medium text-[#dc2626]">{errors.cpf.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="professionalLicense" className="text-sm font-semibold text-[#374151]">
            Registro profissional (CRM/CRP)
          </Label>
          <Input
            id="professionalLicense"
            placeholder="Ex: 123456-SP"
            {...register("professionalLicense")}
          />
          {errors.professionalLicense && (
            <p className="text-xs font-medium text-[#dc2626]">{errors.professionalLicense.message}</p>
          )}
        </div>
      </div>

      {/* Especialidade + Subespecialidade */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="specialty" className="text-sm font-semibold text-[#374151]">Especialidade</Label>
          <Input
            id="specialty"
            placeholder="Ex: Cardiologia"
            {...register("specialty")}
          />
          {errors.specialty && (
            <p className="text-xs font-medium text-[#dc2626]">{errors.specialty.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="subspecialty" className="text-sm font-semibold text-[#374151]">Subespecialidade</Label>
          <Input
            id="subspecialty"
            placeholder="Ex: Cardiologia infantil"
            {...register("subspecialty")}
          />
          {errors.subspecialty && (
            <p className="text-xs font-medium text-[#dc2626]">{errors.subspecialty.message}</p>
          )}
        </div>
      </div>

      {/* Modalidade + Link de referência */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="modality" className="text-sm font-semibold text-[#374151]">Modalidade de atendimento</Label>
          <select
            id="modality"
            className="h-9 px-3 py-1 rounded-md border border-input text-sm text-[#334155] bg-white outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
            {...register("modality")}
          >
            <option value="" disabled>Selecione</option>
            <option value="VIRTUAL">Virtual</option>
            <option value="HOME_VISIT">Domiciliar</option>
            <option value="CLINIC">Clínica</option>
          </select>
          {errors.modality && (
            <p className="text-xs font-medium text-[#dc2626]">{errors.modality.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="referenceLink" className="text-sm font-semibold text-[#374151]">
            Link de referência (Linkedin/Lattes)
          </Label>
          <Input
            id="referenceLink"
            placeholder="Ex: https://..."
            type="url"
            {...register("socialLinks.referenceLink")}
          />
          {errors.socialLinks && (
            <p className="text-xs font-medium text-[#dc2626]">{errors.socialLinks.message}</p>
          )}
        </div>
      </div>

      {/* Biografia — largura total */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio" className="text-sm font-semibold text-[#374151]">Biografia</Label>
        <textarea
          id="bio"
          placeholder="Ex: Sou um profissional de saúde com 10 anos de experiência"
          className="w-full px-3 py-2 rounded-md border border-input text-sm text-[#334155] bg-white outline-none resize-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
          rows={3}
          {...register("bio")}
        />
        {errors.bio && (
          <p className="text-xs font-medium text-[#dc2626]">{errors.bio.message}</p>
        )}
      </div>
    </div>
  );
}
