import { UseFormRegister, FieldErrors } from "react-hook-form";
import { PatientProfileSchema } from "../patient-profile.validation";
import styles from "../profile.module.css";

type PatientInfoFormProps = {
  register: UseFormRegister<PatientProfileSchema>;
  errors: FieldErrors<PatientProfileSchema>;
  email: string;
  isEditing: boolean;
};

export function PatientInfoForm({ register, errors, email, isEditing }: PatientInfoFormProps) {
  return (
    <div className={styles.formGrid}>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Nome Completo</label>
        <input
          type="text"
          className={styles.fieldInput}
          disabled={!isEditing}
          {...register("name")}
        />
        {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Email</label>
        <input type="email" className={styles.fieldInput} value={email} disabled readOnly />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Telefone</label>
        <input
          type="tel"
          className={styles.fieldInput}
          placeholder="(11) 99999-9999"
          disabled={!isEditing}
          {...register("phone")}
        />
        {errors.phone && <span className={styles.fieldError}>{errors.phone.message}</span>}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Data de Nascimento</label>
        <input
          type="date"
          className={styles.fieldInput}
          disabled={!isEditing}
          {...register("dateOfBirth")}
        />
        {errors.dateOfBirth && <span className={styles.fieldError}>{errors.dateOfBirth.message}</span>}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Gênero</label>
        <select
          className={styles.fieldSelect}
          disabled={!isEditing}
          {...register("gender")}
        >
          <option value="">Selecione</option>
          <option value="Masculino">Masculino</option>
          <option value="Feminino">Feminino</option>
          <option value="Outro">Outro</option>
          <option value="Prefiro não informar">Prefiro não informar</option>
        </select>
        {errors.gender && <span className={styles.fieldError}>{errors.gender.message}</span>}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Endereço</label>
        <input
          type="text"
          className={styles.fieldInput}
          placeholder="Rua, número, bairro, cidade"
          disabled={!isEditing}
          {...register("address")}
        />
        {errors.address && <span className={styles.fieldError}>{errors.address.message}</span>}
      </div>
    </div>
  );
}
