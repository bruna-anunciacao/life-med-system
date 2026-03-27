import { type UseFormRegister, type FieldErrors } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import type { ProfessionalFormSchema } from "../admin-user.validation";
import styles from "../user-profile.module.css";

type ProfessionalProfileFormProps = {
  register: UseFormRegister<ProfessionalFormSchema>;
  errors: FieldErrors<ProfessionalFormSchema>;
  isEditing: boolean;
};

export function ProfessionalProfileForm({ register, errors, isEditing }: ProfessionalProfileFormProps) {
  return (
    <>
      <h3 className={styles.sectionLabel}>Informações Profissionais</h3>
      <div className={styles.formGrid}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Nome Completo</label>
          <input className={styles.fieldInput} disabled={!isEditing} {...register("name")} />
          {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Email</label>
          <input className={styles.fieldInput} disabled={!isEditing} {...register("email")} />
          {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>CRM</label>
          <input className={styles.fieldInput} disabled={!isEditing} {...register("professionalLicense")} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Especialidade</label>
          <input className={styles.fieldInput} disabled={!isEditing} {...register("specialty")} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Subespecialidade</label>
          <input className={styles.fieldInput} disabled={!isEditing} {...register("subspecialty")} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Modalidade</label>
          <select className={styles.fieldInput} disabled={!isEditing} {...register("modality")}>
            <option value="VIRTUAL">Virtual</option>
            <option value="HOME_VISIT">Domiciliar</option>
            <option value="CLINIC">Clínica</option>
          </select>
        </div>
      </div>

      <div className={styles.textAreaGroup}>
        <label className={styles.fieldLabel}>Biografia Profissional</label>
        <textarea className={styles.textArea} rows={4} disabled={!isEditing} {...register("bio")} />
      </div>

      <Separator />
      <h3 className={styles.socialLinksTitle}>Links Sociais</h3>
      <div className={styles.formGrid}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Link de referência (LinkedIn/Lattes)</label>
          <input className={styles.fieldInput} disabled={!isEditing} {...register("linkedin")} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Instagram</label>
          <input className={styles.fieldInput} disabled={!isEditing} {...register("instagram")} />
        </div>
      </div>

      <Separator />
      <div className={styles.statusGroup}>
        <label className={styles.fieldLabel}>Status</label>
        <select className={styles.fieldInput} disabled={!isEditing} {...register("status")}>
          <option value="PENDING">Pendente</option>
          <option value="COMPLETED">Completo</option>
          <option value="VERIFIED">Verificado</option>
          <option value="BLOCKED">Bloqueado</option>
        </select>
        {errors.status && <span className={styles.fieldError}>{errors.status.message}</span>}
      </div>
    </>
  );
}
