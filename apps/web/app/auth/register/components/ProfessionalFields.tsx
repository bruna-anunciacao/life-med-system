"use client";

import { type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import styles from "../../auth.module.css";
import type { RegisterFormData } from "../register-validation";

type ProfessionalFieldsProps = {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
};

export function ProfessionalFields({ register, errors }: ProfessionalFieldsProps) {
  return (
    <div className={styles.professionalInputsWrapper}>
      <div className={styles.multipleInputs}>
        <div className="w-full flex flex-col gap-1">
          <Label htmlFor="professionalLicense" className={styles.label}>
            Registro profissional (CRM/CRP)
          </Label>
          <Input
            id="professionalLicense"
            placeholder="Ex: 123456-SP"
            className={styles.input}
            {...register("professionalLicense")}
          />
          {errors.professionalLicense && (
            <p className="text-sm text-destructive">{errors.professionalLicense.message}</p>
          )}
        </div>

        <div className="w-full flex flex-col gap-1">
          <Label htmlFor="specialty" className={styles.label}>Especialidade</Label>
          <Input
            id="specialty"
            placeholder="Ex: Cardiologia"
            className={styles.input}
            {...register("specialty")}
          />
          {errors.specialty && <p className="text-sm text-destructive">{errors.specialty.message}</p>}
        </div>

        <div className="w-full flex flex-col gap-1">
          <Label htmlFor="subspecialty" className={styles.label}>Subespecialidade</Label>
          <Input
            id="subspecialty"
            placeholder="Ex: Cardiologia infantil"
            className={styles.input}
            {...register("subspecialty")}
          />
          {errors.subspecialty && <p className="text-sm text-destructive">{errors.subspecialty.message}</p>}
        </div>

        <div className="w-full flex flex-col gap-1">
          <Label htmlFor="modality" className={styles.label}>Modalidade de atendimento</Label>
          <select id="modality" className={styles.input} {...register("modality")}>
            <option value="" disabled>Selecione</option>
            <option value="VIRTUAL">Virtual</option>
            <option value="HOME_VISIT">Domiciliar</option>
            <option value="CLINIC">Clínica</option>
          </select>
          {errors.modality && <p className="text-sm text-destructive">{errors.modality.message}</p>}
        </div>
      </div>

      <div className="w-full flex flex-col gap-1">
        <Label htmlFor="bio" className={styles.label}>Biografia</Label>
        <textarea
          id="bio"
          placeholder="Ex: Sou um profissional de saúde com 10 anos de experiência"
          className={styles.textarea}
          rows={4}
          {...register("bio")}
        />
        {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
      </div>

      <div className="w-full flex flex-col gap-1">
        <Label htmlFor="referenceLink" className={styles.label}>
          Link de referência (Linkedin/Lattes)
        </Label>
        <Input
          id="referenceLink"
          placeholder="Ex: https://..."
          type="url"
          className={styles.input}
          {...register("socialLinks.referenceLink")}
        />
        {errors.socialLinks && <p className="text-sm text-destructive">{errors.socialLinks.message}</p>}
      </div>
    </div>
  );
}
