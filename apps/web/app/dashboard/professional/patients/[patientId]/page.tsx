"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { usePatientDetail } from "@/queries/useProfessionalPatients";
import { useUpdateAppointmentStatusMutation } from "@/queries/useProfessionalAppointments";
import { PageShell, PageHeader } from "../../../../ui/dashboard/page-shell";
import { ConfirmModal } from "../../schedule/components/ConfirmModal";
import { formatPhoneNumber } from "@/app/utils/formatPhone";
import {
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  XIcon,
  UserCheckIcon,
  XCircleIcon,
  VideoIcon,
  HouseIcon,
  BuildingsIcon,
  ArrowSquareOutIcon,
} from "../../../../utils/icons";

type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";

type Modality = "VIRTUAL" | "HOME_VISIT" | "CLINIC";

const STATUS_META: Record<AppointmentStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Pendente",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  CONFIRMED: {
    label: "Confirmado",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  COMPLETED: {
    label: "Atendido",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  NO_SHOW: {
    label: "Faltou",
    className: "bg-orange-50 text-orange-700 border border-orange-200",
  },
  CANCELLED: {
    label: "Cancelado",
    className: "bg-red-50 text-red-600 border border-red-200",
  },
};

const MODALITY_META: Record<Modality, { label: string; icon: React.ReactNode }> = {
  VIRTUAL: { label: "Online", icon: <VideoIcon size={14} /> },
  HOME_VISIT: { label: "Domiciliar", icon: <HouseIcon size={14} /> },
  CLINIC: { label: "Presencial", icon: <BuildingsIcon size={14} /> },
};

function ModalityBadge({ modality }: { modality?: Modality }) {
  const meta = modality ? MODALITY_META[modality] : MODALITY_META.VIRTUAL;
  return (
    <Badge className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
      {meta.icon}
      {meta.label}
    </Badge>
  );
}

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

const ALL_STATUSES: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "NO_SHOW",
  "CANCELLED",
];

function AppointmentStatusActions({
  apt,
  isUpdating,
  onAction,
}: {
  apt: { id: string; status: AppointmentStatus };
  isUpdating: boolean;
  onAction: (id: string, status: AppointmentStatus) => void;
}) {
  const [open, setOpen] = useState(false);

  const otherStatuses = ALL_STATUSES.filter((s) => s !== apt.status);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isUpdating}
        className="text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2 disabled:opacity-50"
        title="Alterar status desta consulta"
      >
        Alterar status
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-6 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-1 min-w-[160px]">
            {otherStatuses.map((s) => (
              <button
                key={s}
                className="w-full text-left text-[13px] px-3 py-2 rounded-lg hover:bg-slate-50 text-gray-700 flex items-center gap-2"
                onClick={() => {
                  setOpen(false);
                  onAction(apt.id, s);
                }}
              >
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    s === "COMPLETED"
                      ? "bg-emerald-500"
                      : s === "CONFIRMED"
                        ? "bg-blue-500"
                        : s === "PENDING"
                          ? "bg-amber-500"
                          : s === "NO_SHOW"
                            ? "bg-orange-500"
                            : "bg-red-500"
                  }`}
                />
                {STATUS_META[s].label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params?.patientId as string;

  const { data: patient, isLoading } = usePatientDetail(patientId, true);
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateAppointmentStatusMutation();

  const [pendingAction, setPendingAction] = useState<{
    id: string;
    status: AppointmentStatus;
  } | null>(null);

  const { upcoming, past } = useMemo(() => {
    const history = (patient?.history || []) as {
      id: string;
      dateTime: string;
      status: AppointmentStatus;
      modality?: Modality;
      notes?: string;
    }[];
    const now = new Date();
    const sorted = [...history].sort(
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
    );
    const up = sorted
      .filter(
        (a) =>
          new Date(a.dateTime) >= now &&
          (a.status === "CONFIRMED" || a.status === "PENDING"),
      )
      .sort(
        (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      );
    return { upcoming: up, past: sorted };
  }, [patient]);

  const handleConfirmAction = (notes?: string) => {
    if (!pendingAction) return;
    updateStatus(
      { id: pendingAction.id, status: pendingAction.status, notes },
      { onSuccess: () => setPendingAction(null) },
    );
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  if (isLoading || !patient) {
    return (
      <PageShell>
        <div className="py-20 flex justify-center">
          <Spinner size="md" />
        </div>
      </PageShell>
    );
  }

  const completedCount = patient.history.filter(
    (a) => a.status === "COMPLETED",
  ).length;

  const nextAppt = upcoming[0];

  return (
    <PageShell>
      <PageHeader
        title={patient.name}
        description="Perfil, próxima consulta e histórico do paciente."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() =>
                router.push(
                  "/dashboard/professional/medical-records?search=" +
                    encodeURIComponent(patient.name),
                )
              }
              title="Ver prontuários deste paciente"
            >
              <ArrowSquareOutIcon size={16} />
              Prontuário
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/dashboard/professional/patients")}
              title="Voltar para a lista de pacientes"
            >
              Voltar
            </Button>
          </div>
        }
      />

      {/* Dados do paciente */}
      <Card className="mb-6 border border-gray-200 rounded-xl">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-16 h-16 rounded-full font-bold flex items-center justify-center text-blue-700 bg-blue-50 border border-blue-100 shrink-0 text-2xl">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">{patient.name}</h2>
              <p className="text-sm text-gray-500">{patient.email}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">CPF</p>
              <p className="text-sm text-gray-900 font-medium">{formatCpf(patient.cpf)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Telefone</p>
              <p className="text-sm text-gray-900 font-medium">{formatPhone(patient.phone)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total de consultas</p>
              <p className="text-2xl font-bold text-gray-900">{patient.history.length}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Atendimentos</p>
              <p className="text-2xl font-bold text-emerald-600">{completedCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Próxima consulta */}
      {nextAppt && (
        <div className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-700">
            <CalendarIcon size={18} weight="duotone" /> Próxima Consulta
          </h2>
          <Card className="border-l-4 border-l-[#006fee]">
            <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <ModalityBadge modality={nextAppt.modality} />
                  <Badge className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_META[nextAppt.status].className}`}>
                    {STATUS_META[nextAppt.status].label}
                  </Badge>
                </div>
                <p className="flex items-center gap-1.5 text-gray-700 font-medium">
                  <ClockIcon size={16} /> {formatDateTime(nextAppt.dateTime)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {nextAppt.status === "PENDING" && (
                  <Button
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    disabled={isUpdating}
                    onClick={() => setPendingAction({ id: nextAppt.id, status: "CONFIRMED" })}
                  >
                    <CheckIcon /> Confirmar
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  disabled={isUpdating}
                  onClick={() => setPendingAction({ id: nextAppt.id, status: "COMPLETED" })}
                >
                  <UserCheckIcon /> Marcar Atendido
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                  disabled={isUpdating}
                  onClick={() => setPendingAction({ id: nextAppt.id, status: "NO_SHOW" })}
                >
                  <XCircleIcon /> Faltou
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  disabled={isUpdating}
                  onClick={() => setPendingAction({ id: nextAppt.id, status: "CANCELLED" })}
                >
                  <XIcon /> Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Histórico */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-700">
          Histórico de Consultas
        </h2>
        <Card className="border border-gray-200 rounded-xl">
          <CardContent className="p-0">
            {past.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Nenhuma consulta registrada para este paciente.
              </div>
            ) : (
              past.map((apt) => {
                const meta = STATUS_META[apt.status];
                const isClosed =
                  apt.status === "COMPLETED" ||
                  apt.status === "NO_SHOW" ||
                  apt.status === "CANCELLED";
                return (
                  <div
                    key={apt.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800">
                        {formatDateTime(apt.dateTime)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <ModalityBadge modality={apt.modality} />
                        {apt.notes && (
                          <span className="text-xs text-gray-400 italic truncate">
                            {apt.notes}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={`px-2 py-1 rounded-3xl text-xs font-semibold ${meta.className}`}>
                        {meta.label}
                      </Badge>

                      {/* Ações rápidas para consultas ainda abertas */}
                      {!isClosed && (
                        <>
                          {apt.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2.5 text-blue-700 border-blue-200 hover:bg-blue-50"
                              disabled={isUpdating}
                              onClick={() => setPendingAction({ id: apt.id, status: "CONFIRMED" })}
                            >
                              <CheckIcon size={16} />
                              <span className="hidden md:inline">Confirmar</span>
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            disabled={isUpdating}
                            onClick={() => setPendingAction({ id: apt.id, status: "COMPLETED" })}
                          >
                            <UserCheckIcon size={16} />
                            <span className="hidden md:inline">Atendido</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2.5 text-orange-600 border-orange-200 hover:bg-orange-50"
                            disabled={isUpdating}
                            onClick={() => setPendingAction({ id: apt.id, status: "NO_SHOW" })}
                          >
                            <XCircleIcon size={16} />
                            <span className="hidden md:inline">Faltou</span>
                          </Button>
                        </>
                      )}

                      {/* Permite corrigir qualquer status, inclusive fechados */}
                      <AppointmentStatusActions
                        apt={apt}
                        isUpdating={isUpdating}
                        onAction={(id, status) => setPendingAction({ id, status })}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmModal
        isOpen={!!pendingAction}
        onOpenChange={(open) => { if (!open) setPendingAction(null); }}
        pendingStatus={pendingAction?.status || ""}
        onConfirm={handleConfirmAction}
      />
    </PageShell>
  );
}
