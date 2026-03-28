import styles from "../user-profile.module.css";

type UserProfileHeaderProps = {
  name: string;
  email: string;
  role: string;
  specialty?: string;
  photoUrl: string | null;
};

export function UserProfileHeader({ name, email, role, specialty, photoUrl }: UserProfileHeaderProps) {
  return (
    <div className={styles.cardHeader}>
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={name}
          style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }}
        />
      ) : (
        <div className={styles.avatarNoPhoto}>{name?.charAt(0).toUpperCase()}</div>
      )}
      <div>
        <h2 className={styles.cardTitle}>{name}</h2>
        <p className={styles.cardEmail}>{email}</p>
        <span className={styles.cardRole}>
          {role === "PROFESSIONAL" ? specialty || "Profissional" : "Paciente"}
        </span>
      </div>
    </div>
  );
}
