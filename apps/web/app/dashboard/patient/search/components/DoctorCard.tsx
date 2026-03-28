import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon } from "../../../../utils/icons";
import styles from "../search.module.css";

type Professional = {
  id: string;
  name: string;
  email: string;
  status: string;
  professionalProfile?: {
    id: string;
    specialty: string;
    professionalLicense: string;
    modality?: string;
    bio?: string;
  };
};

const MODALITY_LABEL: Record<string, string> = {
  VIRTUAL: "Online",
  HOME_VISIT: "Domiciliar",
  CLINIC: "Presencial",
};

type DoctorCardProps = {
  professional: Professional;
};

export function DoctorCard({ professional }: DoctorCardProps) {
  const modality = professional.professionalProfile?.modality;

  return (
    <Card className={styles.doctorCard}>
      <CardContent className={styles.doctorCardBody}>
        <div className={styles.avatarNoPhoto}>
          {professional.name.charAt(0).toUpperCase()}
        </div>

        <div className={styles.doctorInfo}>
          <h3 className={styles.doctorName}>{professional.name}</h3>
          <p className={styles.doctorSpecialty}>
            {professional.professionalProfile?.specialty || "Especialidade não informada"}
          </p>
          {professional.professionalProfile?.professionalLicense && (
            <p className={styles.doctorLicense}>
              CRM: {professional.professionalProfile.professionalLicense}
            </p>
          )}
          <div className={styles.doctorMeta}>
            <Badge className={styles.modalityChip}>
              {MODALITY_LABEL[modality ?? ""] ?? "Online"}
            </Badge>
            {professional.status === "VERIFIED" && (
              <>
                <span className={styles.statusDot} />
                <span className={styles.statusText}>Verificado</span>
              </>
            )}
          </div>
        </div>

        <div className={styles.cardActions}>
          <Button size="sm" className={styles.scheduleButton}>
            <CalendarIcon />
            Agendar
          </Button>
          <Button size="sm" className={styles.profileButton}>Ver Perfil</Button>
        </div>
      </CardContent>
    </Card>
  );
}
