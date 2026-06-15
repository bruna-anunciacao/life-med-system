"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Calendar, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { VulnerabilityBadge } from "@/components/shared/VulnerabilityBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingPage } from "@/components/shared/LoadingPage";
import { useUserQuery } from "@/queries/useUserQuery";
import { useListPatientsQuery } from "@/queries/useListPatientsQuery";
import { useListAppointmentsQuery } from "@/queries/useListAppointmentsQuery";
import type { ManagerPatientResponse } from "@/services/manager-service";
import { PageShell, PageHeader } from "../../ui/dashboard/page-shell";
import { TourButton } from "@/components/tour/TourButton";
import { useIsMobile } from "@/hooks/useIsMobile";
import { AttentionCard } from "./components/AttentionCard";
import { VulnerablePatientsList } from "./components/VulnerablePatientsList";
import { RecentPatientsList } from "./components/RecentPatientsList";

const UPCOMING_LIMIT = 5;
const VULNERABLE_LIMIT = 5;
const RECENT_LIMIT = 5;

const formatAppointmentDate = (dateTime: string) =>
  new Date(dateTime).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const getQuestionnaire = (patient: ManagerPatientResponse) =>
  patient.patientProfile?.questionnaire ?? patient.questionnaire ?? null;

const hasNoQuestionnaire = (patient: ManagerPatientResponse) =>
  !patient.patientProfile?.questionnaireCompleted && !getQuestionnaire(patient);

const ManagerDashboard = () => {
  const isMobile = useIsMobile();
  const { data: user, isLoading: loadingUser } = useUserQuery();
  const { data: patients = [] } = useListPatientsQuery();
  const { data: appointments = [] } = useListAppointmentsQuery();

  const stats = useMemo(() => {
    const withoutQuestionnaire = patients.filter(hasNoQuestionnaire).length;
    const vulnerable = patients.filter(
      (patient) => getQuestionnaire(patient)?.isVulnerable === true,
    ).length;

    return {
      totalPatients: patients.length,
      totalAppointments: appointments.length,
      withoutQuestionnaire,
      vulnerable,
    };
  }, [patients, appointments]);

  const upcomingAppointments = useMemo(() => {
    const now = Date.now();
    return appointments
      .filter(
        (appointment) =>
          (appointment.status === "PENDING" ||
            appointment.status === "CONFIRMED") &&
          new Date(appointment.dateTime).getTime() >= now,
      )
      .sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      )
      .slice(0, UPCOMING_LIMIT);
  }, [appointments]);

  const vulnerablePatients = useMemo(
    () =>
      patients
        .filter((patient) => getQuestionnaire(patient)?.isVulnerable === true)
        .sort(
          (a, b) =>
            (getQuestionnaire(b)?.totalScore ?? 0) -
            (getQuestionnaire(a)?.totalScore ?? 0),
        )
        .slice(0, VULNERABLE_LIMIT),
    [patients],
  );

  const recentPatients = useMemo(
    () =>
      patients
        .filter((patient) => Boolean(patient.createdAt))
        .sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime(),
        )
        .slice(0, RECENT_LIMIT),
    [patients],
  );

  const pendingAppointments = useMemo(
    () => appointments.filter((a) => a.status === "PENDING").length,
    [appointments],
  );

  if (loadingUser) {
    return <LoadingPage />;
  }

  const userName = user?.name?.split(" ")[0] || "";

  const actions = (
    <div id="tour-mgr-actions" className="flex flex-wrap items-center gap-2">
      <Link
        href="/dashboard/manager/patients/new"
        title="Abrir formulário para cadastrar um novo paciente"
        className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-sm transition-colors hover:opacity-90"
      >
        <Plus className="h-3.5 w-3.5" />
        Cadastrar Paciente
      </Link>
      <Link
        href="/dashboard/manager/appointments/new"
        title="Ir para a tela de agendamento de consultas"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
      >
        <Calendar className="h-3.5 w-3.5" />
        Agendar Consulta
      </Link>
    </div>
  );

  return (
    <PageShell>
      <PageHeader
        title={userName ? `Olá, ${userName}!` : "Painel do Gestor"}
        description="Gerencie pacientes e consultas."
        help={<TourButton tour="manager-home" iconOnly={isMobile} />}
        actions={actions}
      />

      <div
        id="tour-mgr-stats"
        className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatCard label="Pacientes" value={stats.totalPatients} />
        <StatCard label="Consultas" value={stats.totalAppointments} />
        <StatCard
          label="Sem questionário"
          value={stats.withoutQuestionnaire}
          valueClassName="text-amber-600"
        />
        <StatCard
          label="Pacientes vulneráveis"
          value={stats.vulnerable}
          valueClassName="text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <section id="tour-mgr-upcoming">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Próximas consultas
              </h2>
              <Link
                href="/dashboard/manager/appointments"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Ver todas
              </Link>
            </div>
            {upcomingAppointments.length === 0 ? (
              <EmptyState
                message="Nenhuma consulta agendada."
                actionLabel="Agendar consulta"
                actionHref="/dashboard/manager/appointments/new"
              />
            ) : (
              <Card className="bg-card">
                <CardContent className="p-0">
                  <ul className="divide-y divide-border">
                    {upcomingAppointments.map((appointment) => (
                      <li
                        key={appointment.id}
                        className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {appointment.patient.name}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            Dr(a). {appointment.professional.name} ·{" "}
                            {formatAppointmentDate(appointment.dateTime)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
                          {appointment.isVulnerable === true && (
                            <VulnerabilityBadge
                              totalScore={appointment.totalScore}
                              isVulnerable={appointment.isVulnerable}
                            />
                          )}
                          <StatusBadge
                            status={appointment.status}
                            type="appointment"
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </section>

          <VulnerablePatientsList patients={vulnerablePatients} />
        </div>

        <div id="tour-mgr-attention" className="flex flex-col gap-6">
          <AttentionCard
            pendingAppointments={pendingAppointments}
            patientsWithoutQuestionnaire={stats.withoutQuestionnaire}
          />
          <RecentPatientsList patients={recentPatients} />
        </div>
      </div>
    </PageShell>
  );
};

export default ManagerDashboard;
