import Image from "next/image";
import Link from "next/link";
import  { Button } from '@heroui/react';
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Image src="/globe.svg" alt="Life Med Logo" width={24} height={24} />
          <span>Life Med</span>
        </div>
        <nav className={styles.nav}>
          <Link href="/auth/login">
            <Button
              className={`${styles.buttonBase} ${styles.buttonSecondary}`}
            >
              Entrar
            </Button>
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>Saúde conectada, simples e segura</h1>

          <p className={styles.subtitle}>
            A Life Med conecta pacientes e profissionais em uma plataforma
            moderna para agendamentos, prontuários e telemedicina.
          </p>

          <div className={styles.ctaGroup}>
            <Link href="/auth/register">
              <Button
                className={`${styles.buttonBase} ${styles.buttonPrimary}`}
              >
                Criar Conta Gratuita
              </Button>
            </Link>
          </div>
        </section>

        <section className={styles.grid}>
          <div className={styles.card}>
            <h2>Pacientes</h2>
            <p>
              Agende consultas, acompanhe seus atendimentos e tenha acesso ao
              seu histórico médico de forma simples e segura.
            </p>
          </div>

          <div className={styles.card}>
            <h2>Profissionais</h2>
            <p>
              Gerencie agenda, pacientes, prontuários e consultas online em um
              único sistema.
            </p>
          </div>

          <div className={styles.card}>
            <h2>Telemedicina</h2>
            <p>
              Atendimento remoto integrado, seguro e sem complicações técnicas.
            </p>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>© 2026 Life Med. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
