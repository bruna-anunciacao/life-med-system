"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { usersService } from "../../../services/users-service";
import { CalendarIcon, ClockIcon, CheckIcon, SearchIcon } from "../../utils/icons";

const PatientDashboard = () => {
  const router = useRouter();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    usersService.getUser().then((data) => setUserName(data.name?.split(" ")[0] || "")).catch(() => {});
  }, []);

  const stats = [
    { title: "Próximas Consultas", value: "2", icon: <CalendarIcon />, colorClass: "bg-blue-50 text-blue-500" },
    { title: "Aguardando Confirmação", value: "1", icon: <ClockIcon />, colorClass: "bg-yellow-50 text-yellow-500" },
    { title: "Consultas Realizadas", value: "5", icon: <CheckIcon />, colorClass: "bg-green-50 text-green-500" },
  ];

  const nextAppointment = {
    doctorName: "Dra. Ana Paula",
    specialty: "Cardiologista",
    time: "14:00 - 15:00",
    date: "24 de Fevereiro",
    type: "VIRTUAL",
    status: "CONFIRMED",
  };

  const upcomingAppointments = [
    { id: 1, doctor: "Dr. Carlos Lima", specialty: "Dermatologista", day: "26", month: "Fev", time: "09:00", status: "CONFIRMED" },
    { id: 2, doctor: "Dra. Fernanda Souza", specialty: "Nutricionista", day: "02", month: "Mar", time: "10:30", status: "PENDING" },
  ];

  const suggestedDoctors = [
    { id: 1, name: "Dr. João Silva", specialty: "Clínico Geral" },
    { id: 2, name: "Dra. Maria Clara", specialty: "Psicóloga" },
    { id: 3, name: "Dr. Pedro Santos", specialty: "Ortopedista" },
  ];

  return (
    <section className="min-h-screen w-full bg-slate-50 p-8">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {userName ? `Olá, ${userName}!` : "Painel do Paciente"}
          </h1>
          <p className="mt-1 text-base text-gray-500">Acompanhe suas consultas e encontre profissionais de saúde.</p>
        </div>
        <Button onClick={() => router.push("/dashboard/patient/search")} className="gap-2 px-4 text-base">
          <SearchIcon />
          Buscar Médicos
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index} className="border border-gray-200 transition-transform hover:-translate-y-0.5">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <h3 className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</h3>
              </div>
              <div className={`flex size-12 items-center justify-center rounded-xl ${stat.colorClass}`}>
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Next appointment */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                <span className="size-2 animate-pulse rounded-full bg-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.2)]" />
                Próxima Consulta
              </h2>
            </div>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="flex flex-col justify-between gap-6 p-6 md:flex-row md:items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">{nextAppointment.doctorName}</h3>
                  <p className="text-sm text-gray-500">{nextAppointment.specialty}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge>{nextAppointment.type === "VIRTUAL" ? "Consulta Online" : "Presencial"}</Badge>
                    <span className="flex items-center gap-1 text-sm font-medium text-gray-500">
                      <ClockIcon /> {nextAppointment.date} • {nextAppointment.time}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button>Ver Detalhes</Button>
                  <Button variant="outline" className="text-red-500 hover:bg-red-50 hover:border-red-300">Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming appointments */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700">Próximas Consultas</h2>
              <Button size="sm" variant="ghost" onClick={() => router.push("/dashboard/patient/appointments")}>
                Ver Todas
              </Button>
            </div>
            <Card className="border border-gray-200">
              <CardContent className="p-0">
                {upcomingAppointments.map((appt, i) => (
                  <div
                    key={appt.id}
                    className={`flex items-center gap-4 p-4 transition-colors hover:bg-slate-50 ${i < upcomingAppointments.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <div className="w-16 text-center">
                      <p className="text-xl font-bold text-blue-500">{appt.day}</p>
                      <p className="text-xs uppercase text-gray-500">{appt.month}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{appt.doctor}</p>
                      <p className="text-xs text-gray-500">{appt.specialty}</p>
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                        <ClockIcon /> {appt.time}
                      </span>
                    </div>
                    <Badge className={appt.status === "CONFIRMED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                      {appt.status === "CONFIRMED" ? "Confirmada" : "Pendente"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-700">Profissionais Disponíveis</h2>
          {suggestedDoctors.map((doc) => (
            <Card key={doc.id} className="border border-gray-200 transition-transform hover:-translate-y-0.5 cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xl font-semibold text-white">
                  {doc.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{doc.name}</p>
                  <p className="text-sm text-gray-500">{doc.specialty}</p>
                </div>
                <Button size="sm" onClick={() => router.push("/dashboard/patient/search")}>
                  Agendar
                </Button>
              </CardContent>
            </Card>
          ))}

          <Card className="border border-blue-100 bg-blue-50">
            <CardContent className="p-4">
              <h4 className="text-base font-semibold text-gray-700">Dica de Saúde</h4>
              <p className="mt-1 text-sm text-gray-500">
                Mantenha suas consultas em dia e não esqueça de verificar a disponibilidade dos profissionais regularmente.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PatientDashboard;
