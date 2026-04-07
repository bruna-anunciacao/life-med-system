"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usersService } from "@/services/users-service";
import {
  appointmentsService,
  AppointmentResponse,
} from "@/services/appointments-service";
import {
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  SearchIcon,
} from "../../utils/icons";
import { Professional, StatItem } from "./patient-dashboard.types";
import { NextAppointmentCard } from "./components/NextAppointmentCard";
import { StatsCards } from "./components/StatsCards";
import { UpcomingAppointmentsList } from "./components/UpcomingAppointmentsList";
import { RecentHistoryList } from "./components/RecentHistoryList";
import { SuggestedDoctorsList } from "./components/SuggestedDoctorsList";
import { HealthTipCard } from "./components/HealthTipCard";

const SUGGESTED_DOCTORS_LIMIT = 3;
const RECENT_HISTORY_LIMIT = 3;

const PatientDashboard = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [userName, setUserName] = useState("");
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [userData, appointmentsData, professionalsData] =
          await Promise.all([
            usersService.getUser(),
            appointmentsService.listMyAppointments({ limit: 100 }),
            usersService.getAllProfessionals(),
          ]);

        setUserName(userData.name?.split(" ")[0] || "");
        if (appointmentsData) setAppointments(appointmentsData.data);
        setProfessionals(
          (professionalsData || []).filter(
            (p: any) => p.status !== "PENDING" && p.status !== "BLOCKED",
          ),
        );
      } catch {
        // partial data is OK for dashboard
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const upcomingList = appointments
    .filter((a) => a.status === "CONFIRMED" || a.status === "PENDING")
    .sort(
      (a, b) =>
        new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
    );

  const recentCompleted = appointments
    .filter((a) => a.status === "COMPLETED")
    .sort(
      (a, b) =>
        new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
    )
    .slice(0, RECENT_HISTORY_LIMIT);

  const pendingCount = appointments.filter(
    (a) => a.status === "PENDING",
  ).length;
  const completedCount = appointments.filter(
    (a) => a.status === "COMPLETED",
  ).length;

  const stats: StatItem[] = [
    {
      title: "Próximas consultas",
      value: String(upcomingList.length),
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

  const goToAppointments = () => router.push("/dashboard/patient/appointments");
  const goToSearch = () => router.push("/dashboard/patient/search");

  if (isLoading) {
    return (
      <section className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" />
      </section>
    );
  }

  return (
    <section
      className={`min-h-screen w-full bg-slate-50 ${isMobile ? "p-4" : "p-8"}`}
    >
      <div
        className={`mb-6 flex items-end justify-between ${isMobile ? "flex-col items-start gap-3" : ""}`}
      >
        <div>
          <h1
            className={`font-bold tracking-tight text-gray-900 ${isMobile ? "text-xl" : "text-2xl"}`}
          >
            {userName ? `Olá, ${userName}!` : "Painel do Paciente"}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Acompanhe suas consultas e encontre profissionais de saúde.
          </p>
        </div>
        <Button
          onClick={goToSearch}
          className={`gap-2 ${isMobile ? "w-full" : ""}`}
        >
          <SearchIcon size={16} />
          Buscar Médicos
        </Button>
      </div>

      <div
        className={`mb-6 grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[1fr_340px]"}`}
      >
        <NextAppointmentCard
          appointment={upcomingList[0]}
          isMobile={isMobile}
          onViewDetails={goToAppointments}
          onBookNew={goToSearch}
        />
        <StatsCards stats={stats} isMobile={isMobile} />
      </div>

      <div
        className={`grid gap-5 ${isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[1fr_340px]"}`}
      >
        <div className="flex flex-col gap-6">
          <UpcomingAppointmentsList
            appointments={upcomingList}
            onViewAll={goToAppointments}
          />
          <RecentHistoryList
            appointments={recentCompleted}
            onViewAll={goToAppointments}
          />
        </div>

        <div className="flex flex-col gap-4">
          <SuggestedDoctorsList
            professionals={professionals.slice(0, SUGGESTED_DOCTORS_LIMIT)}
            onViewAll={goToSearch}
            onBook={goToSearch}
          />
          <HealthTipCard />
        </div>
      </div>
    </section>
  );
};

export default PatientDashboard;
