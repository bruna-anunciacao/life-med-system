import { type UseFormRegister } from "react-hook-form";
import type { ProfileSchema } from "../profile.validation";
import styles from "../profile.module.css";

type SocialLinksFormProps = {
  isEditing: boolean;
  register: UseFormRegister<ProfileSchema>;
};

export function SocialLinksForm({ isEditing, register }: SocialLinksFormProps) {
  return (
    <div className={styles.formGrid}>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Link de referência (Linkedin/Lattes)</label>
        <input
          type="text"
          className={styles.fieldInput}
          disabled={!isEditing}
          {...register("socialLinks.referenceLink")}
        />
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Instagram</label>
        <input
          type="text"
          className={styles.fieldInput}
          disabled={!isEditing}
          {...register("socialLinks.instagram")}
        />
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Outro</label>
        <input
          type="text"
          className={styles.fieldInput}
          disabled={!isEditing}
          {...register("socialLinks.other")}
        />
      </div>
    </div>
  );
}
