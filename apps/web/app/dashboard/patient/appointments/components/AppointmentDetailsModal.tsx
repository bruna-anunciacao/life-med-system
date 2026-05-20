import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "../appointments.types";
import {
  formatDate,
  formatTime,
  getStatusLabel,
  getStatusClass,
  getModalityLabel,
} from "../appointments.utils";

type AppointmentDetailsModalProps = {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AppointmentDetailsModal({
  appointment: appt,
  open,
  onOpenChange,
}: AppointmentDetailsModalProps) {
  if (!appt) return null;

  const { day, month, year } = formatDate(appt.dateTime);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes da Consulta</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-center gap-3">
            {appt.photoUrl ? (
              <Image
                src={appt.photoUrl}
                alt={`Foto de ${appt.doctorName}`}
                width={56}
                height={56}
                className="rounded-full object-cover border border-gray-200 flex-shrink-0"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-full bg-[#e8f1fd] flex items-center justify-center flex-shrink-0"
                aria-label={`Inicial do profissional ${appt.doctorName}`}
              >
                <span className="text-xl font-bold text-[#006fee]">
                  {appt.doctorName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {appt.doctorName}
              </p>
              {appt.specialties.length > 0 && (
                <p className="text-sm text-gray-500">
                  {appt.specialties.join(", ")}
                </p>
              )}
              {appt.bio && (
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                  {appt.bio}
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Data
              </p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {day}/{month}/{year}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Horário
              </p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {formatTime(appt.dateTime)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Modalidade
              </p>
              <Badge className="mt-0.5 text-xs">
                {getModalityLabel(appt.modality)}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Status
              </p>
              <Badge
                className={`mt-0.5 text-xs ${getStatusClass(appt.status)}`}
              >
                {getStatusLabel(appt.status)}
              </Badge>
            </div>
          </div>

          {appt.notes && (
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Observações
              </p>
              <p className="text-sm text-gray-700 mt-1 italic">{appt.notes}</p>
            </div>
          )}

          {appt.modality === "VIRTUAL" && appt.meetLink && (
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                Link da videoconsulta
              </p>
              <a
                href={appt.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full px-4 py-2 rounded-lg text-sm font-semibold bg-[#006fee] text-white hover:bg-[#005ec8] transition-colors"
              >
                Entrar na videoconsulta
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
