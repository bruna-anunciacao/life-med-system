"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DataTablePageSizeSelector,
  DataTablePagination,
} from "@/components/ui/data-table";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { format } from "date-fns";
import { CheckIcon, XIcon } from "../../../utils/icons";
import {
  useProfessionalAppointmentsQuery,
  useUpdateAppointmentStatusMutation,
} from "@/queries/useProfessionalAppointments";
import { useServerPagination } from "@/hooks/useServerPagination";
import { ConfirmModal } from "../schedule/components/ConfirmModal";
import { PageShell, PageHeader } from "../../../ui/dashboard/page-shell";
import { ModalityBadge } from "../components/ModalityBadge";
import type {
  AppointmentResponse,
  AppointmentStatus,
} from "@/services/appointments-service";

type PendingAppointment = AppointmentResponse & { status: "PENDING" };

const PendingRequestsPage = () => {
  const { queryParams, getPaginationProps } = useServerPagination({
    initialPageSize: 20,
    syncUrl: true,
  });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    status: AppointmentStatus;
  } | null>(null);

  const { data, isLoading, isError, isFetching } =
    useProfessionalAppointmentsQuery({
      status: "PENDING",
      ...queryParams,
    });

  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateAppointmentStatusMutation();

  useEffect(() => {
    if (isError) toast.error("Erro ao carregar as solicitações pendentes.");
  }, [isError]);

  const requests = (data?.data || []) as PendingAppointment[];

  const formatFullDateTime = (isoString: string) =>
    format(new Date(isoString), "dd/MM 'às' HH:mm");

  const handleOpenConfirm = (id: string, status: AppointmentStatus) => {
    setPendingAction({ id, status });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = (notes?: string) => {
    if (!pendingAction) return;
    updateStatus(
      { id: pendingAction.id, status: pendingAction.status, notes },
      {
        onSuccess: () => {
          setIsConfirmModalOpen(false);
          setPendingAction(null);
        },
      },
    );
  };

  return (
    <PageShell>
      <PageHeader
        title="Solicitações Pendentes"
        description="Todas as consultas aguardando sua confirmação, ordenadas por data."
      />

      {!isLoading && requests.length > 0 && (
        <div className="mb-4 flex justify-end">
          <DataTablePageSizeSelector {...getPaginationProps(data?.meta)} />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : requests.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="p-10 text-center text-gray-500 text-sm">
            Nenhuma solicitação pendente.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((req) => (
            <Card key={req.id} className="border-none shadow-sm">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">
                    {req.patient.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <ModalityBadge modality={req.modality} />
                    <span className="text-xs text-gray-500">
                      {formatFullDateTime(req.dateTime)}
                    </span>
                  </div>
                  {req.notes && (
                    <p className="text-xs text-gray-400 truncate mt-1">
                      {req.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 items-center justify-end shrink-0">
                  <Button
                    size="sm"
                    title="Aprovar esta solicitação de agendamento"
                    className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={() => handleOpenConfirm(req.id, "CONFIRMED")}
                    disabled={isUpdating}
                  >
                    <CheckIcon />
                    Aceitar
                  </Button>
                  <Button
                    size="sm"
                    title="Recusar esta solicitação de agendamento"
                    className="flex-1 sm:flex-none bg-red-500 hover:bg-red-700 text-white"
                    onClick={() => handleOpenConfirm(req.id, "CANCELLED")}
                    disabled={isUpdating}
                  >
                    <XIcon />
                    Recusar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {requests.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
          <DataTablePagination
            {...getPaginationProps(data?.meta)}
            itemLabel="solicitações"
            busy={isFetching}
          />
        </div>
      )}

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onOpenChange={setIsConfirmModalOpen}
        pendingStatus={pendingAction?.status || ""}
        onConfirm={handleConfirmAction}
      />
    </PageShell>
  );
};

export default PendingRequestsPage;
