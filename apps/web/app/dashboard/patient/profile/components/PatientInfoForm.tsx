import { UseFormRegister, FieldErrors } from "react-hook-form";
import { PatientProfileSchema } from "../patient-profile.validation";
import { formatCpf } from "@/lib/cpf";

type PatientInfoFormProps = {
  register: UseFormRegister<PatientProfileSchema>;
  errors: FieldErrors<PatientProfileSchema>;
  email: string;
  cpf: string;
  isEditing: boolean;
};

export function PatientInfoForm({ register, errors, email, cpf, isEditing }: PatientInfoFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Nome Completo</label>
        <input
          type="text"
          className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
          disabled={!isEditing}
          {...register("name")}
        />
        {errors.name && <span className="text-xs text-red-600 mt-0.5">{errors.name.message}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Email</label>
        <input type="email" className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed" value={email ?? ""} disabled readOnly />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">CPF</label>
        <input
          type="text"
          className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
          value={formatCpf(cpf ?? "")}
          disabled
          readOnly
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Telefone</label>
        <input
          type="tel"
          className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
          placeholder="(11) 99999-9999"
          disabled={!isEditing}
          {...register("phone")}
        />
        {errors.phone && <span className="text-xs text-red-600 mt-0.5">{errors.phone.message}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Data de Nascimento</label>
        <input
          type="date"
          className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
          disabled={!isEditing}
          {...register("dateOfBirth")}
        />
        {errors.dateOfBirth && <span className="text-xs text-red-600 mt-0.5">{errors.dateOfBirth.message}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Gênero</label>
        <select
          className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed appearance-none cursor-pointer"
          disabled={!isEditing}
          {...register("gender")}
        >
          <option value="">Selecione</option>
          <option value="MALE">Masculino</option>
          <option value="FEMALE">Feminino</option>
          <option value="OTHER">Outro</option>
          <option value="UNDISCLOSED">Prefiro não informar</option>
        </select>
        {errors.gender && <span className="text-xs text-red-600 mt-0.5">{errors.gender.message}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Endereço</label>
        <input
          type="text"
          className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
          placeholder="Rua, número, bairro, cidade"
          disabled={!isEditing}
          {...register("address")}
        />
        {errors.address && <span className="text-xs text-red-600 mt-0.5">{errors.address.message}</span>}
      </div>
    </div>
  );
}
