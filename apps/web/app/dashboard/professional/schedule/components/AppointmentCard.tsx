import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVerticalIcon } from "../../../../utils/icons";
import styles from "../schedule.module.css";

type Appointment = {
  id: string;
  dateTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  notes?: string;
  patient: { name: string };
};

const STATUS_CLASS: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-red-100 text-red-700",
  PENDING: "bg-yellow-100 text-yellow-700",
};

const STATUS_TEXT: Record<string, string> = {
  CONFIRMED: "Confirmado",
  COMPLETED: "Realizado",
  CANCELLED: "Cancelado",
  NO_SHOW: "Faltou",
  PENDING: "Pendente",
};

type AppointmentCardProps = {
  appointment: Appointment;
  slot: string;
};

export function AppointmentCard({ appointment, slot }: AppointmentCardProps) {
  const initials = appointment.patient.name.charAt(0).toUpperCase();

  return (
    <Card className={`${styles.appointmentCard} ${styles[appointment.status.toLowerCase()]}`}>
      <CardContent className="flex flex-row items-center gap-4 p-3">
        <div className={styles.apptTime}>
          <span className="font-bold text-gray-800">{slot}</span>
        </div>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex items-center gap-3 flex-1">
          <div className={styles.avatarNoPhoto}>{initials}</div>
          <div>
            <p className="font-semibold text-sm text-gray-900">{appointment.patient.name}</p>
            <Badge className={`${styles.modalityChip} ${STATUS_CLASS[appointment.status] ?? "bg-gray-100 text-gray-700"}`}>
              {STATUS_TEXT[appointment.status] ?? appointment.status}
            </Badge>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-400 hover:bg-accent hover:text-accent-foreground transition-colors">
            <MoreVerticalIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent className={styles.dropdown}>
            {appointment.status === "PENDING" ? (
              <>
                <DropdownMenuItem>Confirmar</DropdownMenuItem>
                <DropdownMenuItem>Cancelar</DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem>Realizado</DropdownMenuItem>
                <DropdownMenuItem>Não Compareceu</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
