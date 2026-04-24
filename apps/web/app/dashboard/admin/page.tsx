"use client";

import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { adminService } from "../../../services/admin-service";
import { toast } from "sonner";
import { UsersTable } from "./components/UsersTable";
import { useQueryClient } from "@tanstack/react-query";

const AdminDashboard = () => {
  const queryClient = useQueryClient();

  const handleStatusChange = async (
    userId: string,
    newStatus: "VERIFIED" | "BLOCKED",
  ) => {
    try {
      await adminService.updateUser(userId, { status: newStatus });
      toast.success("Status atualizado");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar status");
    }
  };

  const manageSpecialitiesLink = (
    <Link
      href="/dashboard/admin/specialidades"
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
    >
      <Stethoscope className="h-3.5 w-3.5" />
      Gerenciar Especialidades
    </Link>
  );

  return (
    <section className="px-4 py-4 sm:px-6 sm:py-6">
      <UsersTable onStatusChange={handleStatusChange} actions={manageSpecialitiesLink} />
    </section>
  );
};

export default AdminDashboard;
