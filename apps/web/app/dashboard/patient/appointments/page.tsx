"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton } from "@/components/ui/skeletons";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/useIsMobile";
import { SearchIcon } from "../../../utils/icons";
import { Appointment, TabKey } from "./appointments.types";
import { AppointmentTabs } from "./components/AppointmentTabs";
import { AppointmentCard } from "./components/AppointmentCard";
import { EmptyAppointments } from "./components/EmptyAppointments";
import { AppointmentDetailsModal } from "./components/AppointmentDetailsModal";
import { patientsService } from "@/services/patients-service";
import { CancelConfirmDialog } from "./components/CancelConfirmDialog";
import {
  appointmentsService,
  AppointmentResponse,
} from "@/services/appointments-service";
import { PageShell, PageHeader } from "../../../ui/dashboard/page-shell";
import { TourButton } from "@/components/tour/TourButton";

function mapApiToAppointment(appt: AppointmentResponse): Appointment {
  return {
    id: appt.id,
    professionalId: appt.professional.id,
    doctorName: appt.professional.name,
    specialties: appt.professional.specialties ?? [],
    photoUrl: appt.professional.photoUrl,
    bio: appt.professional.bio,
    dateTime: appt.dateTime,
    status: appt.status,
    modality: appt.modality,
    meetLink: appt.meetLink,
    notes: appt.notes,
  };
}

const getFilteredAppointments = (appointments: Appointment[], tab: TabKey) => {
  switch (tab) {
    case "upcoming":
      return appointments.filter(
        (a) => a.status === "CONFIRMED" || a.status === "PENDING",
      );
    case "past":
      return appointments.filter((a) => a.status === "COMPLETED");
    case "cancelled":
      return appointments.filter((a) => a.status === "CANCELLED");
  }
};

const AppointmentsPage = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(
    null,
  );
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const result = await appointmentsService.listMyAppointments({
          limit: 100,
        });
        if (result) {
          setAppointments(result.data.map(mapApiToAppointment));
        }
      } catch (error) {
        const msg =
          error instanceof Error
            ? error.message
            : "Erro ao carregar consultas.";
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleCancelClick = (id: string) => {
    setAppointmentToCancel(id);
    setIsCancelModalOpen(true);
  };

  const handleDetailsClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  const confirmCancel = async (reason?: string) => {
    if (!appointmentToCancel) return;

    try {
      setIsCancelling(true);
      await appointmentsService.cancel(appointmentToCancel, { reason });
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointmentToCancel
            ? { ...a, status: "CANCELLED" as const }
            : a,
        ),
      );
      toast.success("Consulta cancelada com sucesso.");
      setIsCancelModalOpen(false);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Erro ao cancelar consulta.";
      toast.error(msg);
    } finally {
      setIsCancelling(false);
      setAppointmentToCancel(null);
    }
  };

  const filtered = getFilteredAppointments(appointments, activeTab).sort(
    (a, b) => {
      const dateA = new Date(a.dateTime).getTime();
      const dateB = new Date(b.dateTime).getTime();
      return activeTab === "past" ? dateB - dateA : dateA - dateB;
    },
  );

  const hasReportData = filtered.length > 0;

  const handleDownloadReport = async () => {
    try {
      setIsDownloadingReport(true);

      if (activeTab === "upcoming") {
        await patientsService.downloadPendingAppointmentsReport();
        toast.success("Relatório de consultas pendentes baixado com sucesso.");
        return;
      }

      if (activeTab === "past") {
        await patientsService.downloadDoneAppointmentsReport();
        toast.success("Relatório de consultas realizadas baixado com sucesso.");
        return;
      }

      await patientsService.downloadCancelledAppointmentsReport();
      toast.success("Relatório de consultas canceladas baixado com sucesso.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível baixar o relatório.";
      toast.error(message);
    } finally {
      setIsDownloadingReport(false);
    }
  };

  const reportButtonLabel =
    activeTab === "upcoming"
      ? "Baixar Relatório de Pendentes"
      : activeTab === "past"
        ? "Baixar Relatório de Realizadas"
        : "Baixar Relatório de Canceladas";

  const reportHint =
    activeTab === "upcoming"
      ? "Fazer download do relatório de consultas futuras e pendentes"
      : activeTab === "past"
        ? "Fazer download do histórico de consultas já realizadas"
        : "Fazer download do histórico de consultas canceladas";

  return (
    <PageShell>
      <PageHeader
        title="Minhas Consultas"
        description="Acompanhe e gerencie suas consultas agendadas."
        help={<TourButton tour="patient-appointments" iconOnly={isMobile} />}
        actions={
          <Button
            size={isMobile ? "default" : "lg"}
            onClick={() => router.push("/dashboard/patient/search")}
            title="Buscar médicos e agendar uma nova consulta"
          >
            <SearchIcon />
            Nova Consulta
          </Button>
        }
      />

      <div id="tour-appt-tabs">
        <AppointmentTabs
          activeTab={activeTab}
          appointments={appointments}
          onTabChange={setActiveTab}
        />
      </div>

      {!isMobile && (
        <div className="mb-6 flex justify-end">
          <Button
            id="tour-appt-report"
            size="lg"
            onClick={handleDownloadReport}
            disabled={isDownloadingReport || !hasReportData}
            title={hasReportData ? reportHint : "Nenhum dado disponível para baixar"}
          >
            {isDownloadingReport ? "Gerando relatório..." : reportButtonLabel}
          </Button>
        </div>
      )}

      <div id="tour-appt-list">
        {isLoading ? (
          <CardGridSkeleton count={4} minWidth={400} />
        ) : filtered.length === 0 ? (
          <EmptyAppointments
            activeTab={activeTab}
            onSearch={() => router.push("/dashboard/patient/search")}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onCancel={handleCancelClick}
                onRebook={() => router.push("/dashboard/patient/search")}
                onDetails={handleDetailsClick}
                isMobile={isMobile}
              />
            ))}
          </div>
        )}
      </div>

      {isMobile && (
        <div className="mt-6">
          <Button
            id="tour-appt-report-mobile"
            size="default"
            onClick={handleDownloadReport}
            disabled={isDownloadingReport || !hasReportData}
            title={hasReportData ? reportHint : "Nenhum dado disponível para baixar"}
            className="w-full"
          >
            {isDownloadingReport ? "Gerando relatório..." : reportButtonLabel}
          </Button>
        </div>
      )}
      <CancelConfirmDialog
        open={isCancelModalOpen}
        onOpenChange={setIsCancelModalOpen}
        onConfirm={confirmCancel}
        isLoading={isCancelling}
      />
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
      />
    </PageShell>
  );
};

export default AppointmentsPage;
