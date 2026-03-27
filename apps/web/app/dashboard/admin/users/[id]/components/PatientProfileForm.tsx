import { type UseFormRegister, type FieldErrors } from "react-hook-form";
import type { PatientFormSchema } from "../admin-user.validation";
import styles from "../user-profile.module.css";

type PatientProfileFormProps = {
  register: UseFormRegister<PatientFormSchema>;
  errors: FieldErrors<PatientFormSchema>;
  isEditing: boolean;
};

export function PatientProfileForm({ register, errors, isEditing }: PatientProfileFormProps) {
  return (
    <>
      <h3 className={styles.sectionLabel}>Informações Pessoais</h3>
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
          <label className={styles.fieldLabel}>CPF</label>
          <input className={styles.fieldInput} disabled={!isEditing} {...register("cpf")} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Telefone</label>
          <input className={styles.fieldInput} disabled={!isEditing} {...register("phone")} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Data de Nascimento</label>
          <input type="date" className={styles.fieldInput} disabled={!isEditing} {...register("dateOfBirth")} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Gênero</label>
          <select className={styles.fieldSelect} disabled={!isEditing} {...register("gender")}>
            <option value="">Selecione</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
            <option value="Outro">Outro</option>
            <option value="Prefiro não informar">Prefiro não informar</option>
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Endereço</label>
          <input className={styles.fieldInput} disabled={!isEditing} {...register("address")} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Status</label>
          <select className={styles.fieldInput} disabled={!isEditing} {...register("status")}>
            <option value="PENDING">Pendente</option>
            <option value="COMPLETED">Completo</option>
            <option value="VERIFIED">Verificado</option>
            <option value="BLOCKED">Bloqueado</option>
          </select>
          {errors.status && <span className={styles.fieldError}>{errors.status.message}</span>}
        </div>
      </div>
    </>
  );
}
