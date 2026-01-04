import Image from "next/image";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Image src="/globe.svg" alt="Life Med Logo" width={24} height={24} />
          <span>Life Med</span>
        </div>
        <nav>
          <Link href="/auth/login">
            <Button
              appName="web"
              className={`${styles.buttonBase} ${styles.buttonSecondary}`}
            >
              Acessar Plataforma
            </Button>
          </Link>
        </nav>
      </header>
      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>
            O futuro da gestão médica começa aqui
          </h1>
          <p className={styles.subtitle}>
            Conectamos pacientes e profissionais de saúde em uma experiência
            unificada. Agendamentos, prontuários e telemedicina em um só lugar.
          </p>
          <div className={styles.ctaGroup}>
            <Link href="/auth/register">
              <Button
                appName="web"
                className={`${styles.buttonBase} ${styles.buttonPrimary}`}
              >
                Agendar Consulta
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button
                appName="web"
                className={`${styles.buttonBase} ${styles.buttonSecondary}`}
              >
                Sou Médico
              </Button>
            </Link>
          </div>
        </section>
        <section className={styles.grid}>
          <div className={styles.card}>
            <h2>Para Pacientes</h2>
            <p>
              Encontre especialistas qualificados, agende consultas presenciais
              ou virtuais e mantenha todo o seu histórico médico acessível na
              palma da sua mão.
            </p>
          </div>
          <div className={styles.card}>
            <h2>Para Profissionais</h2>
            <p>
              Gerencie sua agenda, acesse prontuários eletrônicos completos e
              organize suas finanças. Uma suíte completa para otimizar seu
              atendimento.
            </p>
          </div>
          <div className={styles.card}>
            <h2>Telemedicina</h2>
            <p>
              Realize atendimentos remotos com segurança através de nossa
              plataforma de vídeo integrada de alta qualidade. Sem instalações
              extras.
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