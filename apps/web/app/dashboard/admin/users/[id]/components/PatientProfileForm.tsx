import { type UseFormRegister, type FieldErrors, Controller, Control } from "react-hook-form";
import type { PatientFormSchema } from "../admin-user.validation";
import ptBr from "react-phone-number-input/locale/pt-BR";
import PhoneInput from "react-phone-number-input";

type PatientProfileFormProps = {
  register: UseFormRegister<PatientFormSchema>;
  errors: FieldErrors<PatientFormSchema>;
  control: Control<PatientFormSchema>;
  isEditing: boolean;
};

export function PatientProfileForm({ register, errors, control, isEditing }: PatientProfileFormProps) {
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
          <Controller
            name="phone"
            control={control}
            render={({ field }) => {
              let safeValue = field.value
                ? field.value.replace(/[^\d+]/g, "")
                : "";

              if (safeValue && !safeValue.startsWith("+")) {
                safeValue = `+55${safeValue}`;
              }

              return (
                <PhoneInput
                  id="phone"
                  placeholder="(71) 99999-9999"
                  international
                  countryCallingCodeEditable={false}
                  labels={ptBr}
                  defaultCountry="BR"
                  value={safeValue || undefined}
                  onChange={(val) => field.onChange(val || "")}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  disabled={!isEditing}
                  className={`w-full flex items-center border border-gray-200 rounded-lg overflow-hidden transition-colors duration-200 focus-within:border-[#006fee] focus-within:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] ${
                    !isEditing ? "bg-gray-50" : "bg-white"
                  } [&_.PhoneInputCountry]:max-w-[40%] [&_.PhoneInputCountry]:px-3 [&_.PhoneInputCountry]:flex [&_.PhoneInputCountry]:flex-row-reverse [&_.PhoneInputCountry]:items-center [&_.PhoneInputCountry]:justify-start [&_.PhoneInputCountry]:gap-1 [&_.PhoneInputCountry]:border-r [&_.PhoneInputCountry]:border-gray-200 [&_.PhoneInputCountrySelect]:max-w-[80%] [&_.PhoneInputCountryIcon]:w-5 [&_.PhoneInputCountryIcon]:h-[14px] [&_.PhoneInputCountryIcon]:flex [&_.PhoneInputCountryIcon]:justify-center [&_.PhoneInputCountryIcon]:items-center [&_.PhoneInputCountryIcon]:overflow-hidden [&_.PhoneInputCountryIcon_img]:w-full [&_.PhoneInputCountryIcon_img]:h-full [&_.PhoneInputCountryIcon_img]:object-cover [&_.PhoneInputInput]:h-full [&_.PhoneInputInput]:py-2.5 [&_.PhoneInputInput]:px-3 [&_.PhoneInputInput]:flex-1 [&_.PhoneInputInput]:border-none [&_.PhoneInputInput]:text-[0.95rem] [&_.PhoneInputInput]:text-gray-900 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput:disabled]:text-gray-500 [&_.PhoneInputInput:disabled]:cursor-not-allowed`}
                />
              );
            }}
          />
          {errors?.phone && (
            <p className="text-xs text-red-600">{errors.phone.message}</p>
          )}
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
