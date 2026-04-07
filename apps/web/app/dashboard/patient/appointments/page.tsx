"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/useIsMobile";
import { SearchIcon } from "../../../utils/icons";
import { Appointment, TabKey } from "./appointments.types";
import { AppointmentTabs } from "./components/AppointmentTabs";
import { AppointmentCard } from "./components/AppointmentCard";
import { EmptyAppointments } from "./components/EmptyAppointments";
import { patientsService } from "@/services/patients-service";
import {
  appointmentsService,
  AppointmentResponse,
} from "@/services/appointments-service";

function mapApiToAppointment(appt: AppointmentResponse): Appointment {
  return {
    id: appt.id,
    doctorName: appt.professional.name,
    specialty: "",
    dateTime: appt.dateTime,
    status: appt.status,
    modality: "VIRTUAL",
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

  const handleCancel = async (id: string) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja cancelar esta consulta?",
    );
    if (!confirmed) return;

    try {
      await appointmentsService.cancel(id);
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: "CANCELLED" as const } : a,
        ),
      );
      toast.success("Consulta cancelada com sucesso.");
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Erro ao cancelar consulta.";
      toast.error(msg);
    }
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
    <section
      className={`w-full min-h-screen mx-auto bg-[#f8fafc] ${isMobile ? "px-4 py-5" : "px-16 py-8"}`}
    >
      <div
        className={`mb-8 flex justify-between items-start flex-wrap gap-4 ${isMobile ? "flex-col" : ""}`}
      >
        <div>
          <h1
            className={`font-bold text-gray-900 tracking-tight ${isMobile ? "text-2xl" : "text-4xl"}`}
          >
            Minhas Consultas
          </h1>
          <p
            className={`mt-1 text-gray-500 ${isMobile ? "text-sm" : "text-base"}`}
          >
            Acompanhe e gerencie suas consultas agendadas.
          </p>
        </div>
        <Button
          size={isMobile ? "default" : "lg"}
          onClick={() => router.push("/dashboard/patient/search")}
          className={isMobile ? "w-full" : ""}
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

      {!isMobile && (
        <div className="mb-6 flex justify-end">
          <Button
            size="lg"
            onClick={handleDownloadReport}
            disabled={isDownloadingReport}
          >
            {isDownloadingReport ? "Gerando relatório..." : reportButtonLabel}
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="py-16 flex justify-center items-center">
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
              onCancel={handleCancel}
              onRebook={() => router.push("/dashboard/patient/search")}
              isMobile={isMobile}
            />
          ))}
        </div>
      )}

      {isMobile && (
        <div className="mt-6">
          <Button
            size="default"
            onClick={handleDownloadReport}
            disabled={isDownloadingReport}
            className="w-full"
          >
            {isDownloadingReport ? "Gerando relatório..." : reportButtonLabel}
          </Button>
        </div>
      )}
    </section>
  );
};

export default AppointmentsPage;
