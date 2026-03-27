import Link from "next/link";
import styles from "../../auth.module.css";

export function InvalidTokenCard() {
  return (
    <div className={styles.container}>
      <div className={styles.cardNoToken}>
        <div className={styles.noToken}>
          Link inválido. Por favor, solicite a recuperação novamente.
        </div>
        <Link href="/auth/forgot-password" className={styles.button}>
          Voltar
        </Link>
      </div>
    </div>
  );
}
