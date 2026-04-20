import { type UseFormRegister, type FieldErrors } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import type { ProfessionalFormSchema } from "../admin-user.validation";

type ProfessionalProfileFormProps = {
  register: UseFormRegister<ProfessionalFormSchema>;
  errors: FieldErrors<ProfessionalFormSchema>;
  isEditing: boolean;
  specialities: { id: string; name: string }[];
};

export function ProfessionalProfileForm({ register, errors, isEditing, specialities }: ProfessionalProfileFormProps) {
  return (
    <>
      <h3 className="mt-6 mb-1 text-base font-semibold text-gray-700">Informações Profissionais</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Nome Completo</label>
          <input className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed" disabled={!isEditing} {...register("name")} />
          {errors.name && <span className="text-xs text-red-600 mt-0.5">{errors.name.message}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Email</label>
          <input className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed" disabled={!isEditing} {...register("email")} />
          {errors.email && <span className="text-xs text-red-600 mt-0.5">{errors.email.message}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">CRM</label>
          <input className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed" disabled={!isEditing} {...register("professionalLicense")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Especialidade</label>
          <select className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed" disabled={!isEditing} {...register("specialityId")}>
            <option value="">Selecione uma especialidade</option>
            {specialities.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Modalidade</label>
          <select className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed" disabled={!isEditing} {...register("modality")}>
            <option value="VIRTUAL">Virtual</option>
            <option value="HOME_VISIT">Domiciliar</option>
            <option value="CLINIC">Clínica</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mt-5">
        <label className="text-sm font-semibold text-gray-700">Biografia Profissional</label>
        <textarea className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 resize-none font-[inherit] focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed" rows={4} disabled={!isEditing} {...register("bio")} />
      </div>

      <Separator />
      <h3 className="mt-6 text-base font-semibold text-gray-700">Links Sociais</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Link de referência (LinkedIn/Lattes)</label>
          <input className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed" disabled={!isEditing} {...register("linkedin")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Instagram</label>
          <input className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed" disabled={!isEditing} {...register("instagram")} />
        </div>
      </div>

      <Separator />
      <div className="flex flex-col gap-1.5 mt-5 max-w-[50%]">
        <label className="text-sm font-semibold text-gray-700">Status</label>
        <select className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed" disabled={!isEditing} {...register("status")}>
          <option value="PENDING">Pendente</option>
          <option value="COMPLETED">Completo</option>
          <option value="VERIFIED">Verificado</option>
          <option value="BLOCKED">Bloqueado</option>
        </select>
        {errors.status && <span className="text-xs text-red-600 mt-0.5">{errors.status.message}</span>}
      </div>
    </>
  );
}
