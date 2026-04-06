"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { usersService } from "../../../services/users-service";
import {
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  SearchIcon,
} from "../../utils/icons";
import { useMyAppointmentsQuery } from "@/queries/useMyAppointmentsQuery";
import { formatDate, formatTime, getStatusClass, getStatusLabel, getModalityLabel } from "./appointments/appointments.utils";

const PatientDashboard = () => {
  const router = useRouter();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    usersService
      .getUser()
      .then((data) => setUserName(data.name?.split(" ")[0] || ""))
      .catch(() => {});
  }, []);

  const { data: rawAppointments, isLoading: isLoadingAppointments } = useMyAppointmentsQuery();

  const upcomingAppointments = (rawAppointments ?? [])
    .filter((a) => a.status === "CONFIRMED" || a.status === "PENDING")
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const nextAppointment = upcomingAppointments[0] ?? null;
  const remainingAppointments = upcomingAppointments.slice(1, 3);

  const recentCompleted = (rawAppointments ?? [])
    .filter((a) => a.status === "COMPLETED")
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    .slice(0, 3);

  const confirmedCount = upcomingAppointments.filter((a) => a.status === "CONFIRMED").length;
  const pendingCount = upcomingAppointments.filter((a) => a.status === "PENDING").length;
  const completedCount = (rawAppointments ?? []).filter((a) => a.status === "COMPLETED").length;

  const stats = [
    {
      title: "Próximas consultas",
      value: String(confirmedCount),
      icon: <CalendarIcon size={18} weight="duotone" />,
      colorClass: "bg-blue-50 text-blue-500",
    },
    {
      title: "Aguardando confirmação",
      value: String(pendingCount),
      icon: <ClockIcon size={18} weight="duotone" />,
      colorClass: "bg-yellow-50 text-yellow-500",
    },
    {
      title: "Consultas realizadas",
      value: String(completedCount),
      icon: <CheckIcon size={18} weight="duotone" />,
      colorClass: "bg-green-50 text-green-500",
    },
  ];

  const suggestedDoctors = [
    { id: 1, name: "Dr. João Silva", specialty: "Clínico Geral" },
    { id: 2, name: "Dra. Maria Clara", specialty: "Psicóloga" },
    { id: 3, name: "Dr. Pedro Santos", specialty: "Ortopedista" },
  ];

  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter((n) => n.length > 2)
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <section className="min-h-screen w-full bg-slate-50 p-4 sm:p-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            {userName ? `Olá, ${userName}!` : "Painel do Paciente"}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Acompanhe suas consultas e encontre profissionais de saúde.
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/patient/search")} className="gap-2">
          <SearchIcon size={16} />
          Buscar Médicos
        </Button>
      </div>

      {/* Top section: next appointment + stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        <Card className="border border-gray-200 py-0 gap-0">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-2">
              <span className="size-1.5 animate-pulse rounded-full bg-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.2)]" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Próxima consulta
              </span>
            </div>

            {isLoadingAppointments ? (
              <div className="flex justify-center py-6"><Spinner /></div>
            ) : !nextAppointment ? (
              <p className="py-4 text-center text-sm text-gray-400">Nenhuma consulta agendada.</p>
            ) : (
              <>
                <div>
                  <Badge className="px-2.5 text-xs">{getModalityLabel(nextAppointment.modality)}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                    {getInitials(nextAppointment.doctorName)}
                  </div>
                  <div>
                    <p className="text-xl font-bold leading-tight text-gray-900">{nextAppointment.doctorName}</p>
                    <p className="text-sm text-gray-400">{nextAppointment.specialty}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 border border-gray-100 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Data</p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-800">
                      {(() => { const d = formatDate(nextAppointment.dateTime); return `${d.day} de ${d.month}`; })()}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-gray-100 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Horário</p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-800">{formatTime(nextAppointment.dateTime)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => router.push("/dashboard/patient/appointments")}>Ver detalhes</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex h-full flex-col gap-2">
          {stats.map((stat, index) => (
            <Card key={index} className="flex-1 border border-gray-200 py-0 gap-0">
              <CardContent className="flex h-full items-center gap-3 px-4 py-3">
                <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${stat.colorClass}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-400">{stat.title}</p>
                  <p className="text-xl font-bold leading-tight text-gray-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom section: upcoming + history list, sidebar */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Próximas Consultas</h2>
              <button
                onClick={() => router.push("/dashboard/patient/appointments")}
                className="text-xs font-medium text-blue-500 hover:text-blue-600"
              >
                Ver todas →
              </button>
            </div>
            <Card className="border border-gray-200 py-0 gap-0">
              <CardContent className="p-0">
                {isLoadingAppointments ? (
                  <div className="flex justify-center py-8"><Spinner /></div>
                ) : remainingAppointments.length === 0 ? (
                  <p className="p-4 text-center text-sm text-gray-500">Sem outras consultas agendadas.</p>
                ) : (
                  remainingAppointments.map((appt, i) => {
                    const { day, month } = formatDate(appt.dateTime);
                    return (
                      <div
                        key={appt.id}
                        className={`grid grid-cols-[48px_1fr_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50 ${i < remainingAppointments.length - 1 ? "border-b border-gray-100" : ""}`}
                      >
                        <div className="flex flex-col items-center justify-center rounded-lg bg-blue-50 py-2">
                          <span className="text-base font-bold leading-none text-blue-500">{day}</span>
                          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-blue-400">{month}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-800">{appt.doctorName}</p>
                          <p className="text-xs text-gray-400">{appt.specialty}</p>
                          <span className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                            <ClockIcon size={11} /> {formatTime(appt.dateTime)}
                          </span>
                        </div>
                        <Badge className={`h-5 shrink-0 px-2 text-xs ${getStatusClass(appt.status)}`}>
                          {getStatusLabel(appt.status)}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Histórico Recente</h2>
              <button
                onClick={() => router.push("/dashboard/patient/appointments")}
                className="text-xs font-medium text-blue-500 hover:text-blue-600"
              >
                Ver histórico →
              </button>
            </div>
            <Card className="border border-gray-200 py-0 gap-0">
              <CardContent className="p-0">
                {isLoadingAppointments ? (
                  <div className="flex justify-center py-8"><Spinner /></div>
                ) : recentCompleted.length === 0 ? (
                  <p className="p-4 text-center text-sm text-gray-500">Nenhuma consulta realizada.</p>
                ) : (
                  recentCompleted.map((appt, i) => {
                    const { day, month } = formatDate(appt.dateTime);
                    return (
                      <div
                        key={appt.id}
                        className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 ${i < recentCompleted.length - 1 ? "border-b border-gray-100" : ""}`}
                      >
                        <p className="min-w-0 flex-1 truncate text-sm text-gray-600">
                          {appt.doctorName}
                          <span className="mx-1 text-gray-300">·</span>
                          <span className="text-gray-400">{appt.specialty}</span>
                        </p>
                        <span className="shrink-0 text-xs text-gray-400">{day} {month}</span>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="border border-gray-200 py-0 gap-0">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">Profissionais Disponíveis</h2>
                <button
                  onClick={() => router.push("/dashboard/patient/search")}
                  className="text-xs font-medium text-blue-500 hover:text-blue-600"
                >
                  Ver todos →
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {suggestedDoctors.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                      {getInitials(doc.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-400">{doc.specialty}</p>
                    </div>
                    <Button
                      size="sm"
                      className="h-7 shrink-0 px-3 text-xs"
                      onClick={() => router.push("/dashboard/patient/search")}
                    >
                      Agendar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-blue-100 bg-blue-50 py-0 gap-0">
            <CardContent className="flex gap-3 px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-blue-700">Dica de Saúde</p>
                <p className="mt-1 text-xs leading-relaxed text-blue-600">
                  Mantenha suas consultas em dia e não esqueça de verificar a
                  disponibilidade dos profissionais regularmente.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PatientDashboard;
