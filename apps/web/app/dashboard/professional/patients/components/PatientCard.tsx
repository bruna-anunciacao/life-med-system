import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { usePatientDetail } from "@/queries/useProfessionalPatients";
import { formatPhoneNumber } from "@/app/utils/formatPhone";

export interface PatientCardData {
  id: string;
  name: string;
  email: string;
  cpf: string | null;
  phone: string;
  lastVisit: string | null;
  nextVisit: string | null;
  photoUrl?: string;
}

interface PatientCardProps {
  patient: PatientCardData;
}

const STATUS_CLASS: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-red-100 text-red-700",
  PENDING: "bg-[#fef0c7] text-[#b54708]",
};

const STATUS_TEXT: Record<string, string> = {
  CONFIRMED: "Confirmado",
  COMPLETED: "Realizado",
  CANCELLED: "Cancelado",
  NO_SHOW: "Faltou",
  PENDING: "Pendente",
};

function formatCpf(cpf: string | null): string {
  if (!cpf) return "Não informado";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(phone: string): string {
  if (!phone || phone === "Não informado") return "Não informado";
  return formatPhoneNumber(phone);
}

export function PatientCard({ patient }: PatientCardProps) {
  const router = useRouter();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const { data: detailData, isLoading } = usePatientDetail(
    patient.id,
    isHistoryOpen,
  );

  const nextVisitFormatted = patient.nextVisit
    ? new Date(patient.nextVisit).toLocaleDateString("pt-BR")
    : null;
  const lastVisitFormatted = patient.lastVisit
    ? new Date(patient.lastVisit).toLocaleDateString("pt-BR")
    : null;

  const renderAvatar = (
    name: string,
    photoUrl?: string,
    size: "sm" | "md" = "md",
  ) => {
    const sizePx = size === "sm" ? 40 : 48;
    const sizeClass = size === "sm" ? "w-10 h-10" : "w-12 h-12";
    if (photoUrl) {
      return (
        <Image
          src={photoUrl}
          alt={name}
          title={`Foto de perfil de ${name}`}
          width={sizePx}
          height={sizePx}
          className={`${sizeClass} rounded-full object-cover object-center border border-gray-200 bg-[#fafafa] shrink-0`}
        />
      );
    }
    return (
      <div
        title={`Foto de perfil de ${name}`}
        className={`${sizeClass} rounded-full font-semibold flex items-center justify-center text-blue-700 bg-blue-50 border border-blue-100 shrink-0`}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col h-full">
        <div className="flex gap-3 items-center mb-4">
          {renderAvatar(patient.name, patient.photoUrl)}
          <div className="min-w-0 flex-1">
            <h3
              className="font-semibold text-[15px] text-gray-900 truncate"
              title={patient.name}
            >
              {patient.name}
            </h3>
            <p
              className="text-[13px] text-gray-500 truncate"
              title={patient.email}
            >
              {patient.email}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[13px] mb-5">
          <dt className="text-gray-500">CPF</dt>
          <dd
            className="text-gray-800 font-medium truncate"
            title={formatCpf(patient.cpf)}
          >
            {formatCpf(patient.cpf)}
          </dd>
          <dt className="text-gray-500">Telefone</dt>
          <dd
            className="text-gray-800 font-medium truncate"
            title={formatPhone(patient.phone)}
          >
            {formatPhone(patient.phone)}
          </dd>
          {nextVisitFormatted && (
            <>
              <dt className="text-gray-500">Próxima consulta</dt>
              <dd
                className="text-gray-800 font-medium truncate"
                title={nextVisitFormatted}
              >
                {nextVisitFormatted}
              </dd>
            </>
          )}
          {lastVisitFormatted && (
            <>
              <dt className="text-gray-500">Última consulta</dt>
              <dd
                className="text-gray-800 font-medium truncate"
                title={lastVisitFormatted}
              >
                {lastVisitFormatted}
              </dd>
            </>
          )}
          {!nextVisitFormatted && !lastVisitFormatted && (
            <>
              <dt className="text-gray-500">Consultas</dt>
              <dd className="text-gray-400 italic truncate">Nenhuma</dd>
            </>
          )}
        </dl>

        <div className="flex gap-2 mt-auto">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => setIsHistoryOpen(true)}
            title="Ver histórico rápido de consultas deste paciente"
          >
            Histórico
          </Button>
          <Button
            size="sm"
            className="flex-1 text-xs"
            onClick={() =>
              router.push(`/dashboard/professional/patients/${patient.id}`)
            }
            title="Abrir página do paciente para gerenciar consultas"
          >
            Gerenciar
          </Button>
        </div>
      </div>

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-125 rounded-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Histórico de consultas</DialogTitle>
            <DialogDescription>
              Acompanhamento de consultas de {patient.name}.
            </DialogDescription>
          </DialogHeader>

          {isLoading || !detailData ? (
            <div className="py-10 flex justify-center">
              <Spinner size="md" />
            </div>
          ) : detailData.history.length === 0 ? (
            <div className="py-10 text-center text-gray-500 text-sm">
              Nenhuma consulta encontrada no histórico.
            </div>
          ) : (
            <div className="mt-4 flex-1 overflow-y-auto pr-2 space-y-3">
              {detailData.history.map((apt) => {
                const aptDate = new Date(apt.dateTime);
                return (
                  <div
                    key={apt.id}
                    className="p-4 rounded-xl border border-gray-100 bg-slate-50 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold text-gray-900 text-sm">
                          {aptDate.toLocaleDateString("pt-BR")}
                        </span>
                        <span className="text-gray-500 text-sm ml-2">
                          {aptDate.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <Badge
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium border-none shadow-none ${STATUS_CLASS[apt.status] ?? "bg-gray-100 text-gray-700"}`}
                        title={`Status: ${STATUS_TEXT[apt.status] ?? apt.status}`}
                      >
                        {STATUS_TEXT[apt.status] ?? apt.status}
                      </Badge>
                    </div>
                    {apt.notes && (
                      <p className="text-xs text-gray-600 italic bg-white p-2 rounded border border-gray-100">
                        {apt.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
