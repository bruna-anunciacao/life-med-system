import { type UseFormRegister, type FieldErrors } from "react-hook-form";
import type { ProfileSchema } from "../profile.validation";
import styles from "../profile.module.css";

type ProfessionalInfoFormProps = {
  email: string;
  isEditing: boolean;
  register: UseFormRegister<ProfileSchema>;
  errors: FieldErrors<ProfileSchema>;
};

export function ProfessionalInfoForm({ email, isEditing, register, errors }: ProfessionalInfoFormProps) {
  return (
    <>
      <div className={styles.formGrid}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Nome Completo</label>
          <input type="text" className={styles.fieldInput} disabled={!isEditing} {...register("name")} />
          {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Email</label>
          <input type="email" className={styles.fieldInput} value={email} disabled readOnly />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>CRM</label>
          <input type="text" className={styles.fieldInput} disabled={!isEditing} {...register("professionalLicense")} />
          {errors.professionalLicense && <span className={styles.fieldError}>{errors.professionalLicense.message}</span>}
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Especialidade</label>
          <input type="text" className={styles.fieldInput} disabled={!isEditing} {...register("specialty")} />
          {errors.specialty && <span className={styles.fieldError}>{errors.specialty.message}</span>}
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Subespecialidade</label>
          <input type="text" className={styles.fieldInput} disabled={!isEditing} {...register("subspecialty")} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Modalidade</label>
          <select className={styles.fieldSelect} disabled={!isEditing} {...register("modality")}>
            <option value="VIRTUAL">Virtual</option>
            <option value="HOME_VISIT">Domiciliar</option>
            <option value="CLINIC">Clínica</option>
          </select>
          {errors.modality && <span className={styles.fieldError}>{errors.modality.message}</span>}
        </div>
      </div>

      <div className={styles.textAreaGroup}>
        <label className={styles.fieldLabel}>Biografia Profissional</label>
        <textarea
          placeholder="Ex: Sou um profissional de saúde com 10 anos de experiência"
          disabled={!isEditing}
          rows={4}
          className={styles.textArea}
          {...register("bio")}
        />
        {errors.bio && <span className={styles.fieldError}>{errors.bio.message}</span>}
      </div>
    </>
  );
}
