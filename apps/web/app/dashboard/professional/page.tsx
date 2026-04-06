"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  UsersIcon,
  XIcon,
  VideoIcon,
} from "../../utils/icons";
import { useRouter } from "next/navigation";

const ProfessionalDashboard = () => {
  const router = useRouter();

  const handleCalendarClick = () => {
    router.push("/dashboard/professional/schedule");
  };

  const stats = [
    { title: "Consultas Hoje", value: "8", icon: <CalendarIcon size={24} weight="duotone" />, color: "primary" },
    { title: "Pendentes de Aprovação", value: "3", icon: <ClockIcon size={24} weight="duotone" />, color: "warning" },
    { title: "Pacientes Atendidos", value: "142", icon: <UsersIcon size={24} weight="duotone" />, color: "success" },
  ];

  const nextAppointment = {
    patientName: "Lucas Mendes",
    time: "14:00 - 15:00",
    type: "VIRTUAL",
    status: "CONFIRMED",
  };

  const schedule = [
    { time: "09:00", name: "Maria Clara", status: "COMPLETED", type: "Retorno" },
    { time: "10:00", name: "João Pedro", status: "COMPLETED", type: "Primeira Vez" },
    { time: "14:00", name: "Lucas Mendes", status: "UPCOMING", type: "Retorno" },
    { time: "15:30", name: "Fernanda Lima", status: "UPCOMING", type: "Exames" },
  ];

  const requests = [
    { id: 1, name: "Ana Souza", date: "Hoje, 16:30" },
    { id: 2, name: "Carlos Lima", date: "Amanhã, 09:00" },
  ];

  const iconColorClass: Record<string, string> = {
    primary: "bg-blue-50 text-[#006fee]",
    warning: "bg-yellow-50 text-[#f5a524]",
    success: "bg-green-50 text-[#17c964]",
  };

  return (
    <section className="w-full min-h-screen mx-auto px-16 py-8 bg-[#f8fafc]">
      <div className="mb-10 flex justify-between items-center max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Painel Profissional</h1>
          <p className="mt-1 text-base text-gray-500">Gerencie suas consultas e acompanhe seu dia.</p>
        </div>
        <Button size="lg" onClick={handleCalendarClick}>
          <CalendarIcon />
          Minha Agenda
        </Button>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border border-gray-200 rounded-lg transition-transform duration-200 hover:-translate-y-0.5">
            <CardContent className="p-4 flex flex-row justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <h3 className="mt-1 text-4xl font-bold text-gray-900">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${iconColorClass[stat.color]}`}>
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
              <span className="w-2 h-2 rounded-full bg-[#17c964] animate-pulse"></span> Próximo Atendimento
            </h2>
          </div>
          <Card className="mb-8 border-l-4 border-l-[#006fee]">
            <CardContent className="p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">{nextAppointment.patientName}</h3>
                  <div className="flex items-center gap-2 text-gray-500 mt-1">
                    <Badge className="px-2 py-1 rounded text-xs font-semibold">Consulta Online</Badge>
                    <span className="flex items-center gap-1 text-sm font-medium">
                      <ClockIcon /> {nextAppointment.time}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 md:w-auto w-full">
                <Button size="lg">Ver Prontuário</Button>
                <Button size="lg">
                  <VideoIcon />
                  Iniciar Vídeo
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mb-4 flex justify-between items-center">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700">Agenda de Hoje</h2>
          </div>
          <Card className="border border-gray-200 rounded-lg">
            <CardContent>
              {schedule.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 flex items-center gap-4 border-b border-gray-100 last:border-b-0 transition-colors duration-200 hover:bg-gray-50"
                >
                  <div className="w-[60px] font-mono font-semibold text-gray-500 text-center">{item.time}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.type}</p>
                  </div>
                  <Badge
                    className={`px-2 py-1 rounded-3xl text-xs font-semibold ${item.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                  >
                    {item.status === "COMPLETED" ? "Realizado" : "Agendado"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700">Solicitações</h2>
            <Badge className="px-2 py-1 rounded-3xl text-xs font-semibold bg-yellow-100 text-yellow-700">2 Novas</Badge>
          </div>

          <div className="flex flex-col gap-3">
            {requests.map((req) => (
              <Card key={req.id} className="border-none shadow-sm">
                <CardContent className="p-4 flex flex-col items-start gap-4 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800">{req.name}</p>
                    <p className="text-xs text-gray-500">{req.date}</p>
                  </div>
                  <div className="w-full flex gap-2 items-center justify-end">
                    <Button
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600"
                      onClick={() => toast.success("Agendamento aprovado")}
                    >
                      <CheckIcon />
                      Aceitar
                    </Button>
                    <Button size="sm" className="bg-red-500 hover:bg-red-700">
                      <XIcon />
                      Recusar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-2 border border-[#cce7ff] rounded-lg bg-[#f0f9ff]">
            <CardContent>
              <h4 className="text-lg font-semibold text-gray-700">Dica do Sistema</h4>
              <p className="text-sm text-gray-500">
                Mantenha sua agenda atualizada para evitar conflitos de horário.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProfessionalDashboard;
