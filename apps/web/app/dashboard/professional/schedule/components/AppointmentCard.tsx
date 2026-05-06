import React, { useState } from "react";
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
import { ConfirmModal } from "./ConfirmModal";

type Appointment = {
  id: string;
  dateTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  notes?: string;
  patient: { name: string };
};

const STATUS_CLASS: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-700 hover:bg-green-100",
  COMPLETED: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  CANCELLED: "bg-red-100 text-red-700 hover:bg-red-100",
  NO_SHOW: "bg-red-100 text-red-700 hover:bg-red-100",
  PENDING: "bg-[#fef0c7] text-[#b54708] hover:bg-[#fef0c7]",
};

const STATUS_TEXT: Record<string, string> = {
  CONFIRMED: "Confirmado",
  COMPLETED: "Realizado",
  CANCELLED: "Cancelado",
  NO_SHOW: "Faltou",
  PENDING: "Pendente",
};

const CARD_STATUS_CLASS: Record<string, string> = {
  confirmed: "border-l-4 border-l-[#006fee] bg-blue-50/30",
  completed: "border-l-4 border-l-[#17c964] bg-emerald-50/30",
  pending: "border-l-4 border-l-[#f5a524] bg-[#fffbf0]",
  cancelled: "border-l-4 border-l-[#f31260] bg-gray-50 grayscale-[0.5]",
};

type AppointmentCardProps = {
  appointment: Appointment;
  slot: string;
  onStatusChange: (id: string, newStatus: string, notes?: string) => void;
  isReadOnly?: boolean;
};

export function AppointmentCard({
  appointment,
  slot,
  onStatusChange,
  isReadOnly = false,
}: AppointmentCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>("");

  const initials = appointment.patient.name.charAt(0).toUpperCase();
  const statusKey = appointment.status.toLowerCase();

  const handleOpenModal = (status: string) => {
    setPendingStatus(status);
    setIsModalOpen(true);
  };

  const handleConfirm = (notes?: string) => {
    onStatusChange(appointment.id, pendingStatus, notes);
    setIsModalOpen(false);
  };

  return (
    <>
      <Card
        className={`h-full flex flex-col justify-center rounded-xl shadow-sm border border-gray-100 transition-all duration-200 overflow-hidden hover:translate-x-1 hover:shadow-md ${CARD_STATUS_CLASS[statusKey] ?? ""}`}
      >
        <CardContent className="flex flex-row items-center gap-3 sm:gap-4 p-3 sm:p-4">
          <div className="hidden sm:flex items-center justify-center min-w-12">
            <span className="font-bold text-[15px] text-[#0f172a]">{slot}</span>
          </div>
          <Separator
            orientation="vertical"
            className="hidden sm:block w-px bg-gray-200 self-stretch min-h-10 h-auto"
          />
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-medium text-[15px] text-gray-500 bg-white border border-gray-200 shadow-sm shrink-0">
              {initials}
            </div>
            <div className="flex flex-col items-start gap-1 min-w-0">
              <p className="font-semibold text-sm sm:text-[15px] text-[#0f172a] leading-none truncate max-w-full">
                {appointment.patient.name}
              </p>
              <Badge
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium border-none shadow-none w-fit ${STATUS_CLASS[appointment.status] ?? "bg-gray-100 text-gray-700"}`}
              >
                {STATUS_TEXT[appointment.status] ?? appointment.status}
              </Badge>
              {appointment.notes && (
                <p className="text-xs italic text-gray-400 border-t border-gray-100 pt-2 line-clamp-2">
                  Obs:{" "}
                  {appointment.notes}
                </p>
              )}
            </div>
          </div>
          {appointment.status !== "CANCELLED" && !isReadOnly && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-50 text-gray-400 border border-transparent hover:border-gray-200 hover:bg-white hover:text-gray-600 transition-all shadow-sm shrink-0">
                <MoreVerticalIcon className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="p-1 rounded-lg bg-white text-gray-700 shadow-md border-gray-100"
              >
                {appointment.status === "PENDING" && (
                  <>
                    <DropdownMenuItem
                      className="cursor-pointer rounded-md focus:bg-gray-50"
                      onClick={() => handleOpenModal("CONFIRMED")}
                    >
                      Confirmar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer rounded-md focus:bg-red-50 focus:text-red-600 text-red-600"
                      onClick={() => handleOpenModal("CANCELLED")}
                    >
                      Cancelar
                    </DropdownMenuItem>
                  </>
                )}
                {appointment.status === "CONFIRMED" && (
                  <>
                    <DropdownMenuItem
                      className="cursor-pointer rounded-md focus:bg-gray-50"
                      onClick={() => handleOpenModal("COMPLETED")}
                    >
                      Realizado
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer rounded-md focus:bg-gray-50"
                      onClick={() => handleOpenModal("NO_SHOW")}
                    >
                      Não Compareceu
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer rounded-md focus:bg-red-50 focus:text-red-600 text-red-600"
                      onClick={() => handleOpenModal("CANCELLED")}
                    >
                      Cancelar
                    </DropdownMenuItem>
                  </>
                )}
                {appointment.status === "COMPLETED" && (
                  <>
                    <DropdownMenuItem
                      className="cursor-pointer rounded-md focus:bg-gray-50"
                      onClick={() => handleOpenModal("NO_SHOW")}
                    >
                      Não Compareceu
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer rounded-md focus:bg-red-50 focus:text-red-600 text-red-600"
                      onClick={() => handleOpenModal("CANCELLED")}
                    >
                      Cancelar
                    </DropdownMenuItem>
                  </>
                )}
                {appointment.status === "NO_SHOW" && (
                  <>
                    <DropdownMenuItem
                      className="cursor-pointer rounded-md focus:bg-gray-50"
                      onClick={() => handleOpenModal("COMPLETED")}
                    >
                      Realizado
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer rounded-md focus:bg-red-50 focus:text-red-600 text-red-600"
                      onClick={() => handleOpenModal("CANCELLED")}
                    >
                      Cancelar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        pendingStatus={pendingStatus}
        onConfirm={handleConfirm}
      />
    </>
  );
}
