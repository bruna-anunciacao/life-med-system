import { type UseFormRegister, type FieldErrors } from "react-hook-form";
import type { ProfileSchema } from "../profile.validation";

type ProfessionalInfoFormProps = {
  email: string;
  isEditing: boolean;
  register: UseFormRegister<ProfileSchema>;
  errors: FieldErrors<ProfileSchema>;
};

const fieldInputClass =
  "px-3 py-[0.6rem] border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed";

export function ProfessionalInfoForm({ email, isEditing, register, errors }: ProfessionalInfoFormProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-[0.35rem]">
          <label className="text-[0.85rem] font-semibold text-gray-700">Nome Completo</label>
          <input type="text" className={fieldInputClass} disabled={!isEditing} {...register("name")} />
          {errors.name && <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">{errors.name.message}</span>}
        </div>
        <div className="flex flex-col gap-[0.35rem]">
          <label className="text-[0.85rem] font-semibold text-gray-700">Email</label>
          <input type="email" className={fieldInputClass} value={email} disabled readOnly />
        </div>
        <div className="flex flex-col gap-[0.35rem]">
          <label className="text-[0.85rem] font-semibold text-gray-700">CRM</label>
          <input type="text" className={fieldInputClass} disabled={!isEditing} {...register("professionalLicense")} />
          {errors.professionalLicense && <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">{errors.professionalLicense.message}</span>}
        </div>
        <div className="flex flex-col gap-[0.35rem]">
          <label className="text-[0.85rem] font-semibold text-gray-700">Especialidade</label>
          <input type="text" className={fieldInputClass} disabled={!isEditing} {...register("specialty")} />
          {errors.specialty && <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">{errors.specialty.message}</span>}
        </div>
        <div className="flex flex-col gap-[0.35rem]">
          <label className="text-[0.85rem] font-semibold text-gray-700">Subespecialidade</label>
          <input type="text" className={fieldInputClass} disabled={!isEditing} {...register("subspecialty")} />
        </div>
        <div className="flex flex-col gap-[0.35rem]">
          <label className="text-[0.85rem] font-semibold text-gray-700">Modalidade</label>
          <select
            className="px-3 py-[0.6rem] border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 appearance-none cursor-pointer focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
            disabled={!isEditing}
            {...register("modality")}
          >
            <option value="VIRTUAL">Virtual</option>
            <option value="HOME_VISIT">Domiciliar</option>
            <option value="CLINIC">Clínica</option>
          </select>
          {errors.modality && <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">{errors.modality.message}</span>}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-[0.35rem]">
        <label className="text-[0.85rem] font-semibold text-gray-700">Biografia Profissional</label>
        <textarea
          placeholder="Ex: Sou um profissional de saúde com 10 anos de experiência"
          disabled={!isEditing}
          rows={4}
          className="px-3 py-[0.6rem] border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 resize-none focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
          {...register("bio")}
        />
        {errors.bio && <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">{errors.bio.message}</span>}
      </div>
    </>
  );
}
