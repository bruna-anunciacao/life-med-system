import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ClockIcon } from "../../../../utils/icons";
import { Appointment } from "../appointments.types";
import {
  formatDate,
  formatTime,
  getStatusLabel,
  getStatusClass,
  getModalityLabel,
  getCardStatusClass,
} from "../appointments.utils";
import styles from "../appointments.module.css";

type AppointmentCardProps = {
  appointment: Appointment;
  onCancel: (id: string) => void;
  onRebook: () => void;
};

export function AppointmentCard({ appointment: appt, onCancel, onRebook }: AppointmentCardProps) {
  const { day, month, year } = formatDate(appt.dateTime);

  return (
    <Card className={`${styles.appointmentCard} ${getCardStatusClass(appt.status)}`}>
      <CardContent className={`${styles.cardBody} flex-row! items-center!`}>
        <div className={styles.dateBadge}>
          <span className={styles.dateDay}>{day}</span>
          <span className={styles.dateMonth}>{month}</span>
          <span className={styles.dateYear}>{year}</span>
        </div>
        <div className={styles.info}>
          <h3 className={styles.doctorName}>{appt.doctorName}</h3>
          <p className={styles.specialty}>{appt.specialty}</p>
          <div className={styles.meta}>
            <span className={styles.timeText}><ClockIcon /> {formatTime(appt.dateTime)}</span>
            <Badge className={styles.modalityChip}>{getModalityLabel(appt.modality)}</Badge>
            <Badge className={`${styles.statusChip} ${getStatusClass(appt.status)}`}>
              {getStatusLabel(appt.status)}
            </Badge>
          </div>
          {appt.notes && (
            <div className={styles.notesRow}>
              <p className={styles.notesText}>Obs: {appt.notes}</p>
            </div>
          )}
        </div>
        <div className={styles.cardActions}>
          {(appt.status === "CONFIRMED" || appt.status === "PENDING") && (
            <>
              <Button size="sm" className={styles.detailsButton}>Detalhes</Button>
              <Button size="sm" className={styles.cancelButton} onClick={() => onCancel(appt.id)}>Cancelar</Button>
            </>
          )}
          {appt.status === "COMPLETED" && (
            <Button size="sm" className={styles.detailsButton}>Ver Detalhes</Button>
          )}
          {appt.status === "CANCELLED" && (
            <Button size="sm" className={styles.rebookButton} onClick={onRebook}>
              Reagendar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
