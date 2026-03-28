"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SearchIcon } from "../../../utils/icons";
import { Appointment, TabKey } from "./appointments.types";
import { AppointmentTabs } from "./components/AppointmentTabs";
import { AppointmentCard } from "./components/AppointmentCard";
import { EmptyAppointments } from "./components/EmptyAppointments";

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: "1", doctorName: "Dra. Ana Paula", specialty: "Cardiologista", dateTime: "2026-02-24T14:00:00.000Z", status: "CONFIRMED", modality: "VIRTUAL" },
  { id: "2", doctorName: "Dr. Carlos Lima", specialty: "Dermatologista", dateTime: "2026-02-26T09:00:00.000Z", status: "PENDING", modality: "CLINIC" },
  { id: "3", doctorName: "Dra. Fernanda Souza", specialty: "Nutricionista", dateTime: "2026-03-02T10:30:00.000Z", status: "CONFIRMED", modality: "VIRTUAL" },
  { id: "4", doctorName: "Dr. João Silva", specialty: "Clínico Geral", dateTime: "2026-02-10T08:00:00.000Z", status: "COMPLETED", modality: "CLINIC", notes: "Retorno em 30 dias. Exames solicitados." },
  { id: "5", doctorName: "Dra. Maria Clara", specialty: "Psicóloga", dateTime: "2026-01-28T15:00:00.000Z", status: "COMPLETED", modality: "VIRTUAL", notes: "Acompanhamento semanal mantido." },
  { id: "6", doctorName: "Dr. Pedro Santos", specialty: "Ortopedista", dateTime: "2026-02-05T11:00:00.000Z", status: "CANCELLED", modality: "CLINIC" },
];

const getFilteredAppointments = (appointments: Appointment[], tab: TabKey) => {
  switch (tab) {
    case "upcoming": return appointments.filter((a) => a.status === "CONFIRMED" || a.status === "PENDING");
    case "past": return appointments.filter((a) => a.status === "COMPLETED");
    case "cancelled": return appointments.filter((a) => a.status === "CANCELLED");
  }
};

const AppointmentsPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);

  const handleCancel = (id: string) => {
    const confirmed = window.confirm("Tem certeza que deseja cancelar esta consulta?");
    if (!confirmed) return;
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "CANCELLED" as const } : a)));
    toast.success("Consulta cancelada com sucesso.");
  };

  const filtered = getFilteredAppointments(appointments, activeTab).sort((a, b) => {
    const dateA = new Date(a.dateTime).getTime();
    const dateB = new Date(b.dateTime).getTime();
    return activeTab === "past" ? dateB - dateA : dateA - dateB;
  });

  return (
    <section className="w-full min-h-screen mx-auto px-16 py-8 bg-[#f8fafc]">
      <div className="mb-8 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Minhas Consultas</h1>
          <p className="mt-1 text-base text-gray-500">Acompanhe e gerencie suas consultas agendadas.</p>
        </div>
        <Button className="px-4 py-2 flex items-center gap-2 rounded-lg bg-[#006fee] font-semibold text-base text-white cursor-pointer transition-all duration-200 hover:bg-[#0056b3]" onClick={() => router.push("/dashboard/patient/search")}>
          <SearchIcon />
          Nova Consulta
        </Button>
      </div>

      <AppointmentTabs
        activeTab={activeTab}
        appointments={appointments}
        onTabChange={setActiveTab}
      />

      {filtered.length === 0 ? (
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
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default AppointmentsPage;
