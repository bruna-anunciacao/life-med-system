"use client";

import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PhoneInput from "react-phone-number-input";
import ptBr from "react-phone-number-input/locale/pt-BR";
import styles from "../../auth.module.css";
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
        <Label htmlFor="cpf" className={styles.label}>CPF</Label>
        <Input
          id="cpf"
          placeholder="000.000.000-00"
          type="text"
          className={styles.input}
          maxLength={14}
          {...register("cpf", { onChange: onCpfChange })}
        />
        {errors.cpf && <p className="text-sm text-destructive">{errors.cpf.message}</p>}
      </div>

      <div className="w-full flex flex-col gap-1">
        <Label htmlFor="phone" className={styles.label}>Celular</Label>
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
              className={styles.phoneInput}
              value={field.value as string}
              onChange={field.onChange}
              disabled={isLoading}
              defaultCountry="BR"
            />
          )}
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
      </div>

      <div className={styles.multipleInputs}>
        <div className="w-full flex flex-col gap-1">
          <Label htmlFor="dateOfBirth" className={styles.label}>Data de nascimento</Label>
          <input
            id="dateOfBirth"
            type="date"
            className={styles.input}
            {...register("dateOfBirth")}
          />
          {errors.dateOfBirth && (
            <p className="text-sm text-destructive">{errors.dateOfBirth.message as string}</p>
          )}
        </div>

        <div className="w-full flex flex-col gap-1">
          <Label htmlFor="gender" className={styles.label}>Gênero</Label>
          <select id="gender" className={styles.input} {...register("gender")}>
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
