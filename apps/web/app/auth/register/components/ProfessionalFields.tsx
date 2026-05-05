"use client";
import { type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RegisterFormData } from "../register-validation";
import { useSpecialitiesQuery } from "@/queries/useSpecialitiesQuery";

type ProfessionalFieldsProps = {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
};

export function ProfessionalFields({
  register,
  errors,
}: ProfessionalFieldsProps) {
  const { data: specialities = [], isLoading: loadingSpecialities } = useSpecialitiesQuery();

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
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cpf" className="text-sm font-semibold text-[#374151]">CPF</Label>
          <Input
            id="cpf"
            placeholder="000.000.000-00"
            type="text"
            maxLength={14}
            title="Insira o seu CPF (apenas números)"
            aria-label="CPF do profissional"
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
            title="Insira seu registro profissional (ex: CRM ou CRP seguido da UF)"
            aria-label="Registro profissional"
            {...register("professionalLicense")}
          />
          {errors.professionalLicense && (
            <p className="text-xs font-medium text-[#dc2626]">{errors.professionalLicense.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="modality" className="text-sm font-semibold text-[#374151]">Modalidade de atendimento</Label>
          <select
            id="modality"
            title="Selecione a sua principal modalidade de atendimento"
            aria-label="Modalidade de atendimento"
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
            title="Insira o link para seu perfil profissional (Linkedin ou Lattes)"
            aria-label="Link de referência profissional"
            {...register("socialLinks.referenceLink")}
          />
          {errors.socialLinks && (
            <p className="text-xs font-medium text-[#dc2626]">{errors.socialLinks.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="primarySpecialty" className="text-sm font-semibold text-[#374151]">
            Especialidade Principal
          </Label>
          <select
            id="primarySpecialty"
            title="Escolha sua especialidade principal"
            aria-label="Especialidade principal"
            className="h-9 px-3 py-1 rounded-md border border-input text-sm text-[#334155] bg-white outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-50"
            disabled={loadingSpecialities}
            {...register("primarySpecialty")}
          >
            <option value="" disabled>
              {loadingSpecialities ? "Carregando..." : "Selecione..."}
            </option>
            {specialities.map((spec: { id: string; name: string }) => (
              <option key={spec.id} value={spec.id}>
                {spec.name}
              </option>
            ))}
          </select>
          {errors.primarySpecialty && (
            <p className="text-xs font-medium text-[#dc2626]">{errors.primarySpecialty.message as string}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="secondarySpecialty" className="text-sm font-semibold text-[#374151]">
            Subespecialidade <span className="text-gray-400 font-normal">(Opcional)</span>
          </Label>
          <select
            id="secondarySpecialty"
            title="Escolha uma subespecialidade (opcional)"
            aria-label="Subespecialidade opcional"
            className="h-9 px-3 py-1 rounded-md border border-input text-sm text-[#334155] bg-white outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-50"
            disabled={loadingSpecialities}
            {...register("secondarySpecialty")}
          >
            <option value="">Nenhuma</option>
            {specialities.map((spec: { id: string; name: string }) => (
              <option key={spec.id} value={spec.id}>
                {spec.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio" className="text-sm font-semibold text-[#374151]">Biografia</Label>
        <textarea
          id="bio"
          placeholder="Ex: Sou um profissional de saúde com 10 anos de experiência..."
          title="Escreva um breve resumo sobre sua trajetória profissional"
          aria-label="Biografia profissional"
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