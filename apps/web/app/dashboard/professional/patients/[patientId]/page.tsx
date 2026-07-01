"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { usePatientDetail } from "@/queries/useProfessionalPatients";
import { useUpdateAppointmentStatusMutation } from "@/queries/useProfessionalAppointments";
import { PageShell } from "../../../../ui/dashboard/page-shell";
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
  PENDING: { label: "Pendente", className: "bg-amber-50 text-amber-700 border border-amber-200" },
  CONFIRMED: { label: "Confirmado", className: "bg-blue-50 text-blue-700 border border-blue-200" },
  COMPLETED: { label: "Atendido", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  NO_SHOW: { label: "Faltou", className: "bg-orange-50 text-orange-700 border border-orange-200" },
  CANCELLED: { label: "Cancelado", className: "bg-red-50 text-red-600 border border-red-200" },
};

const STATUS_DOT: Record<AppointmentStatus, string> = {
  COMPLETED: "bg-emerald-500",
  CONFIRMED: "bg-blue-500",
  PENDING: "bg-amber-500",
  NO_SHOW: "bg-orange-500",
  CANCELLED: "bg-red-500",
};

const MODALITY_META: Record<Modality, { label: string; icon: React.ReactNode }> = {
  VIRTUAL: { label: "Online", icon: <VideoIcon size={14} /> },
  HOME_VISIT: { label: "Domiciliar", icon: <HouseIcon size={14} /> },
  CLINIC: { label: "Presencial", icon: <BuildingsIcon size={14} /> },
};

const ALL_STATUSES: AppointmentStatus[] = ["PENDING", "CONFIRMED", "COMPLETED", "NO_SHOW", "CANCELLED"];
// Histórico exclui PENDING/CONFIRMED: consultas futuras em aberto aparecem em "Próxima Consulta".
const HISTORY_STATUSES: AppointmentStatus[] = ["COMPLETED", "NO_SHOW", "CANCELLED"];

type PeriodFilter = "ALL" | "30" | "90" | "180";

// Utilitários fora do componente — sem recriação em cada render
function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
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

function patientInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]!.toUpperCase())
    .join("");
}

function ModalityBadge({ modality }: { modality?: Modality }) {
  const meta = modality ? MODALITY_META[modality] : MODALITY_META.VIRTUAL;
  return (
    <Badge className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
      {meta.icon}
      {meta.label}
    </Badge>
  );
}

function AppointmentStatusActions({
  apt,
  isUpdating,
  onAction,
}: {
  apt: { id: string; status: AppointmentStatus; dateTime: string };
  isUpdating: boolean;
  onAction: (id: string, status: AppointmentStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const otherStatuses = ALL_STATUSES.filter((s) => s !== apt.status);

  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuStyle({
        position: "fixed",
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((v) => !v);
  };

  return (
    <div>
      <button
        ref={triggerRef}
        onClick={handleOpen}
        disabled={isUpdating}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Alterar status da consulta de ${formatDateTime(apt.dateTime)}`}
        className="text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2 disabled:opacity-50 whitespace-nowrap"
      >
        Alterar status
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="menu"
            style={menuStyle}
            className="z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-1 min-w-[160px]"
          >
            {otherStatuses.map((s) => (
              <button
                key={s}
                role="menuitem"
                className="w-full text-left text-[13px] px-3 py-2 rounded-lg hover:bg-slate-50 text-gray-700 flex items-center gap-2"
                onClick={() => { setOpen(false); onAction(apt.id, s); }}
              >
                <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[s]}`} />
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

  const { data: patient, isLoading, isError } = usePatientDetail(patientId, !!patientId);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateAppointmentStatusMutation();

  const [pendingAction, setPendingAction] = useState<{ id: string; status: AppointmentStatus } | null>(null);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "ALL">("ALL");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("ALL");

  const { upcoming, appointments } = useMemo(() => {
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
    const isFutureOpen = (a: (typeof sorted)[number]) =>
      new Date(a.dateTime) >= now && (a.status === "CONFIRMED" || a.status === "PENDING");
    const up = sorted
      .filter(isFutureOpen)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    // Consultas futuras ainda não realizadas já aparecem em "Próxima Consulta";
    // o Histórico deve refletir apenas o que já ocorreu ou foi decidido.
    const past = sorted.filter((a) => !isFutureOpen(a));
    return { upcoming: up, appointments: past };
  }, [patient]);

  const filteredAppointments = useMemo(() => {
    let result = appointments;
    if (statusFilter !== "ALL") {
      result = result.filter((a) => a.status === statusFilter);
    }
    if (periodFilter !== "ALL") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - Number(periodFilter));
      result = result.filter((a) => new Date(a.dateTime) >= cutoff);
    }
    return result;
  }, [appointments, statusFilter, periodFilter]);

  const handleConfirmAction = (notes?: string) => {
    if (!pendingAction) return;
    updateStatus(
      { id: pendingAction.id, status: pendingAction.status, notes },
      { onSuccess: () => setPendingAction(null) },
    );
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="py-20 flex justify-center">
          <Spinner size="md" />
        </div>
      </PageShell>
    );
  }

  if (isError || !patient) {
    return (
      <PageShell>
        <div className="py-20 flex flex-col items-center gap-4 text-gray-500">
          <p>Não foi possível carregar os dados do paciente.</p>
          <Button variant="outline" onClick={() => router.back()}>Voltar</Button>
        </div>
      </PageShell>
    );
  }

  const completedCount = patient.history.filter((a) => a.status === "COMPLETED").length;
  const nextAppt = upcoming[0];

  return (
    <PageShell>
      {/* Header: Voltar à esquerda, Prontuário à direita */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          title="Voltar"
        >
          Voltar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            router.push("/dashboard/professional/medical-records?search=" + encodeURIComponent(patient.name))
          }
          title="Ver prontuários deste paciente"
        >
          <ArrowSquareOutIcon size={16} />
          Prontuário
        </Button>
      </div>

      {/* Dados do paciente */}
      <Card className="mb-6 border border-gray-200 rounded-xl">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-16 h-16 rounded-full font-bold flex items-center justify-center text-blue-700 bg-blue-50 border border-blue-100 shrink-0 text-xl">
              {patientInitials(patient.name)}
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">{patient.name}</h1>
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
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white" disabled={isUpdating}
                    onClick={() => setPendingAction({ id: nextAppt.id, status: "CONFIRMED" })}>
                    <CheckIcon /> Confirmar
                  </Button>
                )}
                <Button size="sm" variant="outline" className="text-emerald-700 border-emerald-200 hover:bg-emerald-50" disabled={isUpdating}
                  onClick={() => setPendingAction({ id: nextAppt.id, status: "COMPLETED" })}>
                  <UserCheckIcon /> Marcar Atendido
                </Button>
                <Button size="sm" variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50" disabled={isUpdating}
                  onClick={() => setPendingAction({ id: nextAppt.id, status: "NO_SHOW" })}>
                  <XCircleIcon /> Faltou
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" disabled={isUpdating}
                  onClick={() => setPendingAction({ id: nextAppt.id, status: "CANCELLED" })}>
                  <XIcon /> Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Histórico */}
      <div>
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base font-semibold text-gray-700">Histórico de Consultas</h2>
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              aria-label="Filtrar por status"
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-[#006fee]"
            >
              <option value="ALL">Todos os status</option>
              {HISTORY_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_META[s].label}</option>
              ))}
            </select>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
              aria-label="Filtrar por período"
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-[#006fee]"
            >
              <option value="ALL">Todo o período</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 3 meses</option>
              <option value="180">Últimos 6 meses</option>
            </select>
          </div>
        </div>

        {filteredAppointments.length !== appointments.length && (
          <p className="text-xs text-gray-400 mb-2">
            {filteredAppointments.length} de {appointments.length} consulta{appointments.length !== 1 ? "s" : ""}
          </p>
        )}

        <Card className="border border-gray-200 rounded-xl">
          <CardContent className="p-0">
            {filteredAppointments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {appointments.length === 0
                  ? "Nenhuma consulta registrada para este paciente."
                  : "Nenhuma consulta encontrada com os filtros selecionados."}
              </div>
            ) : (
              filteredAppointments.map((apt) => {
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
                      <p className="font-medium text-gray-800">{formatDateTime(apt.dateTime)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <ModalityBadge modality={apt.modality} />
                        {apt.notes && (
                          <span
                            className="text-xs text-gray-400 italic truncate max-w-[200px]"
                            title={apt.notes}
                          >
                            {apt.notes}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={`px-2 py-1 rounded-3xl text-xs font-semibold ${meta.className}`}>
                        {meta.label}
                      </Badge>

                      {!isClosed && (
                        <>
                          {apt.status === "PENDING" && (
                            <Button size="sm" variant="outline"
                              className="h-8 px-2.5 text-blue-700 border-blue-200 hover:bg-blue-50"
                              disabled={isUpdating}
                              onClick={() => setPendingAction({ id: apt.id, status: "CONFIRMED" })}>
                              <CheckIcon size={16} />
                              <span className="hidden md:inline">Confirmar</span>
                            </Button>
                          )}
                          <Button size="sm" variant="outline"
                            className="h-8 px-2.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            disabled={isUpdating}
                            onClick={() => setPendingAction({ id: apt.id, status: "COMPLETED" })}>
                            <UserCheckIcon size={16} />
                            <span className="hidden md:inline">Atendido</span>
                          </Button>
                          <Button size="sm" variant="outline"
                            className="h-8 px-2.5 text-orange-600 border-orange-200 hover:bg-orange-50"
                            disabled={isUpdating}
                            onClick={() => setPendingAction({ id: apt.id, status: "NO_SHOW" })}>
                            <XCircleIcon size={16} />
                            <span className="hidden md:inline">Faltou</span>
                          </Button>
                        </>
                      )}

                      {/* Correção de status — apenas para consultas já encerradas */}
                      {isClosed && (
                        <AppointmentStatusActions
                          apt={apt}
                          isUpdating={isUpdating}
                          onAction={(id, status) => setPendingAction({ id, status })}
                        />
                      )}
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
