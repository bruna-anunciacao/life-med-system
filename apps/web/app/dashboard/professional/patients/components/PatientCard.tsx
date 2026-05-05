import React, { useState } from "react";
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

export interface PatientCardData {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
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

export function PatientCard({ patient }: PatientCardProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const isAnyModalOpen = isProfileOpen || isHistoryOpen;
  const { data: detailData, isLoading } = usePatientDetail(
    patient.id,
    isAnyModalOpen,
  );

  const visitDate = new Date(patient.lastVisit);
  const isFuture = visitDate > new Date();
  const visitLabel = isFuture ? "Próxima Consulta" : "Última Consulta";
  const formattedDate = visitDate.toLocaleDateString("pt-BR");

  const renderAvatar = (name: string, photoUrl?: string) => {
    if (photoUrl) {
      return (
        <Image
          src={photoUrl}
          alt={name}
          title={`Foto de perfil de ${name}`}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover object-center border border-gray-200 p-1 bg-[#fafafa] shadow-sm shrink-0"
        />
      );
    }
    return (
      <div
        title={`Foto de perfil de ${name}`}
        className="w-12 h-12 rounded-full font-semibold flex items-center justify-center text-[#006fee] bg-[#e6f1ff] border border-gray-200 p-1 shadow-sm shrink-0"
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.05)] flex flex-col justify-between h-full">
        <div>
          <div className="flex gap-4 items-center mb-4">
            {renderAvatar(patient.name, patient.photoUrl)}
            <div className="min-w-0 flex-1">
              <h3
                className="font-semibold text-base text-gray-900 truncate"
                title={patient.name}
              >
                {patient.name}
              </h3>
              <p
                className="text-[0.85rem] text-gray-500 truncate"
                title={patient.email}
              >
                {patient.email}
              </p>
            </div>
          </div>
          <div className="text-[0.9rem] text-gray-700 mb-6">
            <p className="truncate mb-1" title={`Telefone: ${patient.phone}`}>
              <strong>Telefone:</strong> {patient.phone}
            </p>
            <p className="truncate" title={`${visitLabel}: ${formattedDate}`}>
              <strong>{visitLabel}:</strong> {formattedDate}
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-auto">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-gray-200 text-gray-700 text-xs"
            onClick={() => setIsProfileOpen(true)}
            title="Abrir perfil detalhado do paciente"
          >
            Ver Perfil
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
            onClick={() => setIsHistoryOpen(true)}
            title="Ver histórico de consultas deste paciente"
          >
            Histórico
          </Button>
        </div>
      </div>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-106.25 rounded-2xl">
          <DialogHeader>
            <DialogTitle>Perfil do Paciente</DialogTitle>
            <DialogDescription>
              Informações detalhadas de contato e cadastro.
            </DialogDescription>
          </DialogHeader>
          {isLoading || !detailData ? (
            <div className="py-10 flex justify-center">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                {renderAvatar(detailData.name, patient.photoUrl)}
                <div>
                  <h4
                    className="text-lg font-semibold text-gray-900 leading-none mb-1"
                    title={detailData.name}
                  >
                    {detailData.name}
                  </h4>
                  <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md">
                    Paciente Ativo
                  </span>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                    E-mail
                  </p>
                  <p className="text-sm text-gray-900" title={detailData.email}>
                    {detailData.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                    Telefone
                  </p>
                  <p className="text-sm text-gray-900" title={detailData.phone}>
                    {detailData.phone}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                    Total de Consultas
                  </p>
                  <p className="text-sm text-gray-900">
                    {detailData.history.length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-125 rounded-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Histórico de Consultas</DialogTitle>
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
