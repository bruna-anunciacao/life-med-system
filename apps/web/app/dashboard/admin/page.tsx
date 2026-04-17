"use client";

import { adminService } from "../../../services/admin-service";
import { toast } from "sonner";
import { UsersTable } from "./components/UsersTable";
import { LoadingPage } from "@/components/shared/LoadingPage";
import { usePatientsQuery } from "@/queries/usePatientsQuery";
import { useAllProfessionalsQuery } from "@/queries/useAllProfessionalsQuery";
import { useQueryClient } from "@tanstack/react-query";
import { SpecialitiesTable } from "./components/SpecialityTable";
import { useSpecialitiesQuery } from "@/queries/useSpecialitiesQuery";

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const { data: patients = [], isLoading: loadingPatients } = usePatientsQuery();
  const { data: professionals = [], isLoading: loadingProfessionals } = useAllProfessionalsQuery();
  const { data: specialities = [], isLoading: loadingSpecialities } = useSpecialitiesQuery();

  const handleStatusChange = async (
    userId: string,
    newStatus: "VERIFIED" | "BLOCKED",
    listType: "patient" | "professional",
  ) => {
    try {
      await adminService.updateUser(userId, { status: newStatus });
      toast.success(`Status atualizado`);
      queryClient.invalidateQueries({ queryKey: [listType === "patient" ? "admin-patients" : "admin-professionals"] });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar status");
    }
  };

  if (loadingPatients || loadingProfessionals) {
    return <LoadingPage />;
  }

  return (
    <section className="min-h-screen mx-auto px-8 py-8 flex flex-col items-center bg-gray-100">
      <div className="mb-10">
        <h1 className="text-4xl text-center font-bold tracking-tight text-gray-900">Painel Administrativo</h1>
        <p className="mt-2 text-base text-gray-500">Gerencie permissões e visualize usuários do sistema.</p>
      </div>

      <UsersTable
        users={patients}
        listType="patient"
        title="Pacientes"
        emptyMessage="Nenhum paciente encontrado."
        onStatusChange={handleStatusChange}
      />

      <UsersTable
        users={professionals}
        listType="professional"
        title="Profissionais"
        emptyMessage="Nenhum profissional encontrado."
        onStatusChange={handleStatusChange}
      />

      <SpecialitiesTable specialities={specialities} />
    </section>
  );
};

export default AdminDashboard;
