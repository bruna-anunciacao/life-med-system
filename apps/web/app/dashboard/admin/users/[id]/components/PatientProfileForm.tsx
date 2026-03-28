import { type UseFormRegister, type FieldErrors } from "react-hook-form";
import type { PatientFormSchema } from "../admin-user.validation";

type PatientProfileFormProps = {
  register: UseFormRegister<PatientFormSchema>;
  errors: FieldErrors<PatientFormSchema>;
  isEditing: boolean;
};

export function PatientProfileForm({ register, errors, isEditing }: PatientProfileFormProps) {
  return (
    <>
      <h3 className="mt-6 mb-1 text-base font-semibold text-gray-700">Informações Pessoais</h3>
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
          <label className="text-sm font-semibold text-gray-700">CPF</label>
          <input className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed" disabled={!isEditing} {...register("cpf")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Telefone</label>
          <input className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed" disabled={!isEditing} {...register("phone")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Data de Nascimento</label>
          <input type="date" className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed" disabled={!isEditing} {...register("dateOfBirth")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Gênero</label>
          <select className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed appearance-none cursor-pointer" disabled={!isEditing} {...register("gender")}>
            <option value="">Selecione</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
            <option value="Outro">Outro</option>
            <option value="Prefiro não informar">Prefiro não informar</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Endereço</label>
          <input className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed" disabled={!isEditing} {...register("address")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Status</label>
          <select className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed" disabled={!isEditing} {...register("status")}>
            <option value="PENDING">Pendente</option>
            <option value="COMPLETED">Completo</option>
            <option value="VERIFIED">Verificado</option>
            <option value="BLOCKED">Bloqueado</option>
          </select>
          {errors.status && <span className="text-xs text-red-600 mt-0.5">{errors.status.message}</span>}
        </div>
      </div>
    </>
  );
}
