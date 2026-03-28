import { Button } from "@/components/ui/button";
import { CalendarIcon } from "../../../../utils/icons";
import { TabKey } from "../appointments.types";
import styles from "../appointments.module.css";

type EmptyAppointmentsProps = {
  activeTab: TabKey;
  onSearch: () => void;
};

export function EmptyAppointments({ activeTab, onSearch }: EmptyAppointmentsProps) {
  const title =
    activeTab === "upcoming"
      ? "Nenhuma consulta agendada"
      : activeTab === "past"
        ? "Nenhuma consulta realizada"
        : "Nenhuma consulta cancelada";

  const text =
    activeTab === "upcoming"
      ? "Busque um profissional para agendar sua consulta."
      : "Suas consultas aparecerão aqui.";

  return (
    <div className={styles.emptyState}>
      <CalendarIcon />
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={styles.emptyText}>{text}</p>
      {activeTab === "upcoming" && (
        <Button className={styles.emptyButton} onClick={onSearch}>
          Buscar Médicos
        </Button>
      )}
    </div>
  );
}
