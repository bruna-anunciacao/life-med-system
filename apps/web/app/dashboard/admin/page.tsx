"use client";

import { User } from "../../../services/auth-service";
import { usersService } from "../../../services/users-service";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { UsersTable } from "./components/UsersTable";

const AdminDashboard = () => {
  const [patients, setPatients] = useState<User[]>([]);
  const [professionals, setProfessionals] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const handleStatusChange = async (
    userId: string,
    newStatus: "VERIFIED" | "BLOCKED",
    listType: "patient" | "professional",
  ) => {
    try {
      await usersService.updateUserStatus(userId, newStatus);
      toast.success(`Status atualizado`);

      const updateList = (list: User[]) =>
        list.map((u) => (u.id === userId ? { ...u, status: newStatus } : u));

      if (listType === "professional") {
        setProfessionals((prev) => updateList(prev));
      } else {
        setPatients((prev) => updateList(prev));
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar status");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patientsData, professionalsData] = await Promise.all([
          usersService.getAllPatients(),
          usersService.getAllProfessionals(),
        ]);
        setPatients(patientsData);
        setProfessionals(professionalsData);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao carregar dados do sistema.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
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
    </section>
  );
};

export default AdminDashboard;
