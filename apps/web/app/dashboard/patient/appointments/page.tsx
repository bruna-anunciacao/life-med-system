"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SearchIcon } from "../../../utils/icons";
import { Appointment, TabKey } from "./appointments.types";
import { AppointmentTabs } from "./components/AppointmentTabs";
import { AppointmentCard } from "./components/AppointmentCard";
import { EmptyAppointments } from "./components/EmptyAppointments";
import { CancelConfirmDialog } from "./components/CancelConfirmDialog";
import { patientsService } from "@/services/patients-service";
import { useMyAppointmentsQuery } from "@/queries/useMyAppointmentsQuery";
import { useCancelAppointmentMutation } from "@/queries/useCancelAppointmentMutation";
import { AppointmentItem } from "@/services/appointments-service";

const mapToAppointment = (item: AppointmentItem): Appointment => ({
  id: item.id,
  professionalId: item.professionalId,
  doctorName: item.doctorName,
  specialty: item.specialty,
  dateTime: item.dateTime,
  status: item.status,
  modality: item.modality,
  notes: item.notes,
});

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
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const { data: rawAppointments, isLoading } = useMyAppointmentsQuery();
  const cancelMutation = useCancelAppointmentMutation();

  const appointments: Appointment[] = (rawAppointments ?? []).map(mapToAppointment);

  const handleCancelClick = (id: string) => {
    setCancelTarget(id);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = () => {
    if (!cancelTarget) return;
    cancelMutation.mutate(cancelTarget, {
      onSuccess: () => {
        toast.success("Consulta cancelada com sucesso.");
        setCancelDialogOpen(false);
        setCancelTarget(null);
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "Erro ao cancelar consulta.",
        );
      },
    });
  };

  const filtered = getFilteredAppointments(appointments, activeTab).sort(
    (a, b) => {
      const dateA = new Date(a.dateTime).getTime();
      const dateB = new Date(b.dateTime).getTime();
      return activeTab === "past" ? dateB - dateA : dateA - dateB;
    },
  );

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

  return (
    <section className="w-full min-h-screen mx-auto px-16 py-8 bg-[#f8fafc]">
      <div className="mb-8 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Minhas Consultas
          </h1>
          <p className="mt-1 text-base text-gray-500">
            Acompanhe e gerencie suas consultas agendadas.
          </p>
        </div>
        <Button
          className="px-4 py-2 flex items-center gap-2 rounded-lg bg-[#006fee] font-semibold text-base text-white cursor-pointer transition-all duration-200 hover:bg-[#0056b3]"
          onClick={() => router.push("/dashboard/patient/search")}
        >
          <SearchIcon />
          Nova Consulta
        </Button>
      </div>

      <AppointmentTabs
        activeTab={activeTab}
        appointments={appointments}
        onTabChange={setActiveTab}
      />

      <div className="mb-6 flex justify-end">
        <Button
          className="px-4 py-2 rounded-lg bg-[#006fee] font-semibold text-sm text-white cursor-pointer transition-all duration-200 hover:bg-[#0056b3] disabled:opacity-60"
          onClick={handleDownloadReport}
          disabled={isDownloadingReport}
        >
          {isDownloadingReport ? "Gerando relatório..." : reportButtonLabel}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
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
            />
          ))}
        </div>
      )}

      <CancelConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancelConfirm}
        isLoading={cancelMutation.isPending}
      />
    </section>
  );
};

export default AppointmentsPage;
