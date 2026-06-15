"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { DashboardHomeSkeleton } from "@/components/ui/skeletons";
import { format } from "date-fns";
import {
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  UsersIcon,
  XIcon,
  VideoIcon,
  HouseIcon,
  BuildingsIcon,
  UserCheckIcon,
  XCircleIcon,
} from "../../utils/icons";
import { useRouter } from "next/navigation";
import { useDailyScheduleQuery } from "@/queries/useDailyScheduleQuery";
import { useUpdateAppointmentStatusMutation } from "@/queries/useProfessionalAppointments";
import { ConfirmModal } from "./schedule/components/ConfirmModal";
import { PageShell, PageHeader } from "../../ui/dashboard/page-shell";
import { TourButton } from "@/components/tour/TourButton";

type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";

type Modality = "VIRTUAL" | "HOME_VISIT" | "CLINIC";

type Appointment = {
  id: string;
  dateTime: string;
  status: AppointmentStatus;
  modality?: Modality;
  notes?: string;
  meetLink?: string | null;
  patient: { id: string; name: string; email?: string; phone?: string | null };
};

const STATUS_META: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
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

const MODALITY_META: Record<
  Modality,
  { label: string; icon: React.ReactNode }
> = {
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

const ProfessionalDashboard = () => {
  const router = useRouter();
  const dateStr = format(new Date(), "yyyy-MM-dd");

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    status: AppointmentStatus;
  } | null>(null);

  const {
    data: scheduleData,
    isLoading,
    isError,
  } = useDailyScheduleQuery(dateStr);

  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateAppointmentStatusMutation();

  useEffect(() => {
    if (isError) toast.error("Erro ao carregar a agenda do dia.");
  }, [isError]);

  const {
    todayAppointments,
    pendingRequests,
    nextAppointment,
    completedToday,
  } = useMemo(() => {
    const appts = (scheduleData?.appointments || []) as Appointment[];
    const now = new Date();

    const today = appts.filter(
      (a) => a.status !== "CANCELLED" && a.status !== "PENDING",
    );

    const pending = appts.filter((a) => a.status === "PENDING");

    const next = appts.find(
      (a) => a.status === "CONFIRMED" && new Date(a.dateTime) >= now,
    );

    const completed = appts.filter((a) => a.status === "COMPLETED").length;

    return {
      todayAppointments: today,
      pendingRequests: pending,
      nextAppointment: next,
      completedToday: completed,
    };
  }, [scheduleData]);

  const formatTime = (isoString: string) =>
    new Date(isoString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleCalendarClick = () => {
    router.push("/dashboard/professional/schedule");
  };

  const handleOpenConfirm = (id: string, status: AppointmentStatus) => {
    setPendingAction({ id, status });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = (notes?: string) => {
    if (!pendingAction) return;
    updateStatus(
      { id: pendingAction.id, status: pendingAction.status, notes },
      {
        onSuccess: () => {
          setIsConfirmModalOpen(false);
          setPendingAction(null);
        },
      },
    );
  };

  const stats = [
    {
      title: "Consultas Hoje",
      value: todayAppointments.length.toString(),
      hint: "Confirmadas e atendidas",
      icon: <CalendarIcon size={24} weight="duotone" />,
      color: "primary",
    },
    {
      title: "Pendentes de Aprovação",
      value: pendingRequests.length.toString(),
      hint: "Aguardando sua confirmação",
      icon: <ClockIcon size={24} weight="duotone" />,
      color: "warning",
    },
    {
      title: "Pacientes Atendidos",
      value: (scheduleData?.attendedPatientsCount ?? 0).toString(),
      hint: "Total de pacientes já atendidos",
      icon: <UsersIcon size={24} weight="duotone" />,
      color: "success",
    },
  ];

  const iconColorClass: Record<string, string> = {
    primary: "bg-blue-50 text-[#006fee]",
    warning: "bg-yellow-50 text-[#f5a524]",
    success: "bg-green-50 text-[#17c964]",
  };

  if (isLoading) {
    return (
      <PageShell>
        <DashboardHomeSkeleton />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Painel Profissional"
        description="Gerencie suas consultas e acompanhe seu dia."
        help={<TourButton tour="professional-home" />}
        actions={
          <Button
            id="tour-prof-agenda-btn"
            size="lg"
            className="w-full sm:w-auto"
            title="Acessar calendário completo da agenda"
            onClick={handleCalendarClick}
          >
            <CalendarIcon />
            Minha Agenda
          </Button>
        }
      />

      <div
        id="tour-prof-stats"
        className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="border border-gray-200 rounded-lg transition-transform duration-200 hover:-translate-y-0.5"
          >
            <CardContent className="p-4 flex flex-row justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>
                <h3 className="mt-1 text-4xl font-bold text-gray-900">
                  {stat.value}
                </h3>
                <p className="mt-1 text-xs text-gray-400">{stat.hint}</p>
              </div>
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-xl ${iconColorClass[stat.color]}`}
              >
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <div className="flex flex-col gap-8">
          {/* Próximo atendimento */}
          <div id="tour-prof-next-appt">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                <span className="w-2 h-2 rounded-full bg-[#17c964] animate-pulse"></span>{" "}
                Próximo Atendimento
              </h2>
            </div>
            {nextAppointment ? (
              <Card className="border-l-4 border-l-[#006fee]">
                <CardContent className="p-6 flex flex-col md:flex-row md:flex-wrap md:justify-between md:items-center gap-4 md:gap-6">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">
                        {nextAppointment.patient.name}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-500 mt-1">
                        <ModalityBadge modality={nextAppointment.modality} />
                        <span className="flex items-center gap-1 text-sm font-medium">
                          <ClockIcon /> {formatTime(nextAppointment.dateTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 md:w-auto w-full">
                    {nextAppointment.modality === "VIRTUAL" && (
                      <Button
                        size="lg"
                        title={
                          nextAppointment.meetLink
                            ? "Iniciar videochamada da consulta"
                            : "Link da videochamada ainda não disponível"
                        }
                        className="flex-1 sm:flex-none"
                        disabled={!nextAppointment.meetLink}
                        onClick={() =>
                          nextAppointment.meetLink &&
                          window.open(nextAppointment.meetLink, "_blank")
                        }
                      >
                        <VideoIcon />
                        Iniciar Vídeo
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-gray-200">
                <CardContent className="p-8 text-center text-gray-500">
                  Nenhum atendimento próximo agendado para hoje.
                </CardContent>
              </Card>
            )}
          </div>

          {/* Agenda de hoje */}
          <div id="tour-prof-today">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                Agenda de Hoje
              </h2>
              {todayAppointments.length > 0 && (
                <span className="text-sm text-gray-400">
                  {completedToday} de {todayAppointments.length} atendidos
                </span>
              )}
            </div>
            <Card className="border border-gray-200 rounded-lg">
              <CardContent className="p-0">
                {todayAppointments.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Sua agenda está livre hoje.
                  </div>
                ) : (
                  todayAppointments.map((item) => {
                    const meta = STATUS_META[item.status];
                    const isClosed =
                      item.status === "COMPLETED" || item.status === "NO_SHOW";
                    const canRegister = !isClosed;
                    return (
                      <div
                        key={item.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 border-b border-gray-100 last:border-b-0 transition-colors duration-200 hover:bg-gray-50"
                      >
                        <div className="sm:w-16 font-mono font-semibold text-gray-600 text-center shrink-0">
                          {formatTime(item.dateTime)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            {item.patient.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <ModalityBadge modality={item.modality} />
                            {item.notes && (
                              <span className="text-xs text-gray-400 truncate">
                                {item.notes}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            className={`px-2 py-1 rounded-3xl text-xs font-semibold ${meta.className}`}
                          >
                            {meta.label}
                          </Badge>
                          {canRegister && (
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                title="Marcar como atendido"
                                className="h-8 px-2.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleOpenConfirm(item.id, "COMPLETED")
                                }
                              >
                                <UserCheckIcon size={16} />
                                <span className="hidden md:inline">
                                  Atendido
                                </span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                title="Marcar paciente como faltante"
                                className="h-8 px-2.5 text-orange-600 border-orange-200 hover:bg-orange-50"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleOpenConfirm(item.id, "NO_SHOW")
                                }
                              >
                                <XCircleIcon size={16} />
                                <span className="hidden md:inline">Faltou</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Solicitações */}
        <div id="tour-prof-requests" className="flex flex-col gap-4">
          <div className="mb-2 flex justify-between items-center">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
              Solicitações
            </h2>
            {pendingRequests.length > 0 && (
              <Badge className="px-2 py-1 rounded-3xl text-xs font-semibold bg-yellow-100 text-yellow-700">
                {pendingRequests.length} Novas
              </Badge>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {pendingRequests.length === 0 ? (
              <Card className="border-none shadow-sm">
                <CardContent className="p-6 text-center text-gray-500 text-sm">
                  Nenhuma solicitação pendente.
                </CardContent>
              </Card>
            ) : (
              pendingRequests.map((req) => (
                <Card key={req.id} className="border-none shadow-sm">
                  <CardContent className="p-4 flex flex-col items-start gap-4 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {req.patient.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <ModalityBadge modality={req.modality} />
                        <span className="text-xs text-gray-500">
                          Hoje, {formatTime(req.dateTime)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full flex gap-2 items-center justify-end">
                      <Button
                        size="sm"
                        title="Aprovar esta solicitação de agendamento"
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                        onClick={() => handleOpenConfirm(req.id, "CONFIRMED")}
                        disabled={isUpdating}
                      >
                        <CheckIcon />
                        Aceitar
                      </Button>
                      <Button
                        size="sm"
                        title="Recusar esta solicitação de agendamento"
                        className="flex-1 bg-red-500 hover:bg-red-700 text-white"
                        onClick={() => handleOpenConfirm(req.id, "CANCELLED")}
                        disabled={isUpdating}
                      >
                        <XIcon />
                        Recusar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <Card className="mt-4 border border-[#cce7ff] rounded-lg bg-[#f0f9ff]">
            <CardContent>
              <h4 className="text-lg font-semibold text-gray-700">
                Dica do Sistema
              </h4>
              <p className="text-sm text-gray-500">
                Marque as consultas como <strong>Atendido</strong> ou{" "}
                <strong>Faltou</strong> ao final de cada atendimento para manter
                seus indicadores corretos.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onOpenChange={setIsConfirmModalOpen}
        pendingStatus={pendingAction?.status || ""}
        onConfirm={handleConfirmAction}
      />
    </PageShell>
  );
};

export default ProfessionalDashboard;
