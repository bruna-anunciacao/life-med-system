"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import {
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  UsersIcon,
  XIcon,
  VideoIcon,
} from "../../utils/icons";
import { useRouter } from "next/navigation";
import { useDailyScheduleQuery } from "@/queries/useDailyScheduleQuery";
import { useProfessionalPatients } from "@/queries/useProfessionalPatients";
import { useUpdateAppointmentStatusMutation } from "@/queries/useProfessionalAppointments";
import { ConfirmModal } from "./schedule/components/ConfirmModal";

type Appointment = {
  id: string;
  dateTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  modality?: "VIRTUAL" | "HOME_VISIT" | "CLINIC";
  notes?: string;
  patient: { id: string; name: string; email?: string; phone?: string };
};

const ProfessionalDashboard = () => {
  const router = useRouter();
  const dateStr = format(new Date(), "yyyy-MM-dd");

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    status: "CONFIRMED" | "CANCELLED";
  } | null>(null);

  const {
    data: scheduleData,
    isLoading: isLoadingSchedule,
    isError: isErrorSchedule,
  } = useDailyScheduleQuery(dateStr);

  const {
    data: patients,
    isLoading: isLoadingPatients,
    isError: isErrorPatients,
  } = useProfessionalPatients();

  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateAppointmentStatusMutation();

  useEffect(() => {
    if (isErrorSchedule) toast.error("Erro ao carregar a agenda do dia.");
    if (isErrorPatients)
      toast.error("Erro ao carregar os dados dos pacientes.");
  }, [isErrorSchedule, isErrorPatients]);

  const isLoading = isLoadingSchedule || isLoadingPatients;

  const { todayAppointments, pendingRequests, nextAppointment } =
    useMemo(() => {
      if (!scheduleData) {
        return {
          todayAppointments: [] as Appointment[],
          pendingRequests: [] as Appointment[],
          nextAppointment: undefined,
        };
      }

      const appts = (scheduleData.appointments || []) as Appointment[];
      const now = new Date();

      const today = appts.filter(
        (a) => a.status !== "CANCELLED" && a.status !== "PENDING",
      );

      const pending = appts.filter((a) => a.status === "PENDING");

      const next = appts.find(
        (a) => a.status === "CONFIRMED" && new Date(a.dateTime) >= now,
      );

      return {
        todayAppointments: today,
        pendingRequests: pending,
        nextAppointment: next,
      };
    }, [scheduleData]);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCalendarClick = () => {
    router.push("/dashboard/professional/schedule");
  };

  const handleOpenConfirm = (id: string, status: "CONFIRMED" | "CANCELLED") => {
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
      icon: <CalendarIcon size={24} weight="duotone" />,
      color: "primary",
    },
    {
      title: "Pendentes de Aprovação",
      value: pendingRequests.length.toString(),
      icon: <ClockIcon size={24} weight="duotone" />,
      color: "warning",
    },
    {
      title: "Pacientes Atendidos",
      value: (patients?.length || 0).toString(),
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
      <div className="flex w-full min-h-screen items-center justify-center bg-[#f8fafc]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <section className="w-full min-h-screen mx-auto px-4 py-6 sm:px-16 sm:py-8 bg-[#f8fafc]">
      <div className="mb-10 flex justify-between items-center max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Painel Profissional
          </h1>
          <p className="mt-1 text-sm sm:text-base text-gray-500">
            Gerencie suas consultas e acompanhe seu dia.
          </p>
        </div>
        <Button
          size="lg"
          className="w-full sm:w-auto"
          title="Acessar calendário completo da agenda"
          onClick={handleCalendarClick}
        >
          <CalendarIcon />
          Minha Agenda
        </Button>
      </div>
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                <span className="w-2 h-2 rounded-full bg-[#17c964] animate-pulse"></span>{" "}
                Próximo Atendimento
              </h2>
            </div>
            {nextAppointment ? (
              <Card className="border-l-4 border-l-[#006fee]">
                <CardContent className="p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">
                        {nextAppointment.patient.name}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-500 mt-1">
                        <Badge className="px-2 py-1 rounded text-xs font-semibold">
                          Consulta Online
                        </Badge>
                        <span className="flex items-center gap-1 text-sm font-medium">
                          <ClockIcon /> {formatTime(nextAppointment.dateTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 md:w-auto w-full">
                    <Button
                      size="lg"
                      variant="outline"
                      title="Acessar prontuário detalhado do paciente"
                      className="flex-1 sm:flex-none"
                    >
                      Ver Prontuário
                    </Button>
                    <Button
                      size="lg"
                      title="Iniciar videochamada da consulta"
                      className="flex-1 sm:flex-none"
                    >
                      <VideoIcon />
                      Iniciar Vídeo
                    </Button>
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
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                Agenda de Hoje
              </h2>
            </div>
            <Card className="border border-gray-200 rounded-lg">
              <CardContent>
                {todayAppointments.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Sua agenda está livre hoje.
                  </div>
                ) : (
                  todayAppointments.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 flex items-center gap-4 border-b border-gray-100 last:border-b-0 transition-colors duration-200 hover:bg-gray-50"
                    >
                      <div className="w-15 font-mono font-semibold text-gray-500 text-center">
                        {formatTime(item.dateTime)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {item.patient.name}
                        </p>
                        <p className="text-xs text-gray-500">{item.notes}</p>
                      </div>
                      <Badge
                        className={`px-2 py-1 rounded-3xl text-xs font-semibold ${
                          item.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.status === "COMPLETED" ? "Realizado" : "Agendado"}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex flex-col gap-4">
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
                      <p className="text-xs text-gray-500">
                        Hoje, {formatTime(req.dateTime)}
                      </p>
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
                Mantenha sua agenda atualizada para evitar conflitos de horário.
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
    </section>
  );
};

export default ProfessionalDashboard;
