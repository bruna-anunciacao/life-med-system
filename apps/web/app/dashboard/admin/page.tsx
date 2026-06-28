"use client";

import Link from "next/link";
import { ClipboardList, Plus, Stethoscope } from "lucide-react";
import { adminService, type AdminUser } from "@/services/admin-service";
import { toast } from "sonner";
import { UsersTable } from "@/app/dashboard/admin/components/UsersTable";
import { useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/app/ui/dashboard/page-shell";
import { TourButton } from "@/components/tour/TourButton";

const AdminDashboard = () => {
  const queryClient = useQueryClient();

  const handleStatusChange = async (
    userId: string,
    newStatus: "VERIFIED" | "BLOCKED",
  ) => {
    // Optimistic update: atualiza o cache imediatamente antes da chamada de API
    queryClient.setQueriesData<AdminUser[]>(
      { queryKey: ["admin-users"] },
      (old) =>
        old?.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)) ??
        old,
    );
    try {
      await adminService.updateUser(userId, { status: newStatus });
      toast.success("Status do usuário atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível atualizar o status do usuário. Tente novamente.");
      // Reverte em caso de erro
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    }
  };

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        id="tour-admin-new-manager"
        href="/dashboard/admin/managers/new"
        className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-sm transition-colors hover:opacity-90"
      >
        <Plus className="h-3.5 w-3.5" />
        Cadastrar Gestor
      </Link>
      <Link
        id="tour-admin-specialties"
        href="/dashboard/admin/specialties"
        title="Acessar painel de gerenciamento de especialidades médicas"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
      >
        <Stethoscope className="h-3.5 w-3.5" />
        Gerenciar Especialidades
      </Link>
      <Link
        id="tour-admin-questionnaires"
        href="/dashboard/admin/questionnaires"
        title="Editar o questionário de vulnerabilidade"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
      >
        <ClipboardList className="h-3.5 w-3.5" />
        Gerenciar Questionário
      </Link>
      <TourButton tour="admin-home" />
    </div>
  );

  return (
    <PageShell>
      <UsersTable onStatusChange={handleStatusChange} actions={actions} />
    </PageShell>
  );
};

export default AdminDashboard;
