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

const CARD_STATUS_CLASS: Record<string, string> = {
  confirmed: "border-l-4 border-l-[#006fee] bg-gradient-to-r from-blue-50 to-white",
  completed: "border-l-4 border-l-[#17c964] opacity-80 bg-[#fcfcfc]",
  pending: "border-l-4 border-l-[#f5a524] bg-gradient-to-r from-yellow-50 to-white",
  cancelled: "border-l-4 border-l-[#f31260] opacity-60 grayscale-[0.8]",
};

type AppointmentCardProps = {
  appointment: Appointment;
  slot: string;
};

export function AppointmentCard({ appointment, slot }: AppointmentCardProps) {
  const initials = appointment.patient.name.charAt(0).toUpperCase();
  const statusKey = appointment.status.toLowerCase();

  return (
    <Card className={`h-full flex flex-row items-center gap-4 shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-gray-100 transition-all duration-200 overflow-hidden hover:translate-x-1 hover:shadow-md ${CARD_STATUS_CLASS[statusKey] ?? ""}`}>
      <CardContent className="flex flex-row items-center gap-4 p-3">
        <div className="flex flex-col items-center justify-center min-w-[60px]">
          <span className="font-bold text-gray-800">{slot}</span>
        </div>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm text-gray-500 bg-[#fafafa] border border-gray-200 p-1 shadow-sm">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">{appointment.patient.name}</p>
            <Badge className={`px-2 py-0.5 ${STATUS_CLASS[appointment.status] ?? "bg-gray-100 text-gray-700"}`}>
              {STATUS_TEXT[appointment.status] ?? appointment.status}
            </Badge>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-400 hover:bg-accent hover:text-accent-foreground transition-colors">
            <MoreVerticalIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="p-2 rounded-lg bg-white text-gray-700 shadow-sm">
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
