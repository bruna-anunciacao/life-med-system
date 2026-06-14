"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  CheckCircle,
  Clock,
  X,
  XCircle,
} from "lucide-react";
import { CancelConfirmDialog } from "@/app/dashboard/patient/appointments/components/CancelConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { VulnerabilityBadge } from "@/components/shared/VulnerabilityBadge";
import {
  DataTable,
  DataTableBody,
  DataTableCard,
  DataTableCell,
  DataTableEmpty,
  DataTableHead,
  DataTableHeadCell,
  DataTableMobileItem,
  DataTableMobileList,
  DataTableRow,
  SortableHeader,
} from "@/components/ui/data-table";
import {
  PageHeaderSkeleton,
  StatsCardsSkeleton,
  TableSkeleton,
} from "@/components/ui/skeletons";
import { useIsMobile, useMounted } from "@/hooks/useIsMobile";
import { useCancelAppointmentManagerMutation } from "@/queries/useCancelAppointmentManagerMutation";
import { useListAppointmentsQuery } from "@/queries/useListAppointmentsQuery";
import type {
  AppointmentSortOrder,
  ManagementAppointment,
} from "@/services/manager-service";

type SortField =
  | "patient"
  | "professional"
  | "dateTime"
  | "scheduledBy"
  | "status"
  | "vulnerabilityScore";

type ClientSortField = Exclude<SortField, "vulnerabilityScore">;

function getSortValue(
  appointment: ManagementAppointment,
  field: ClientSortField,
) {
  switch (field) {
    case "patient":
      return appointment.patient.name || appointment.patient.email;
    case "professional":
      return appointment.professional.name || appointment.professional.email;
    case "dateTime":
      return appointment.dateTime;
    case "scheduledBy":
      return appointment.scheduledByManager?.user.name ?? "";
    case "status":
      return appointment.status;
  }
}

export function ManagementAppointmentsView({
  canManage = false,
}: {
  canManage?: boolean;
}) {
  const isMobile = useIsMobile();
  const mounted = useMounted();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<AppointmentSortOrder>("asc");

  const vulnerabilitySort =
    sortField === "vulnerabilityScore"
      ? { sortBy: "vulnerabilityScore" as const, order: sortDir }
      : undefined;
  const {
    data: appointments = [],
    isLoading,
    error,
  } = useListAppointmentsQuery(vulnerabilitySort);
  const cancelMutation = useCancelAppointmentManagerMutation();

  const filteredAppointments = useMemo(() => {
    if (!statusFilter) return appointments;
    return appointments.filter(
      (appointment) => appointment.status === statusFilter,
    );
  }, [appointments, statusFilter]);

  const sortedAppointments = useMemo(() => {
    if (!sortField || sortField === "vulnerabilityScore") {
      return filteredAppointments;
    }

    return [...filteredAppointments].sort((left, right) => {
      const comparison = getSortValue(left, sortField).localeCompare(
        getSortValue(right, sortField),
      );
      return sortDir === "asc" ? comparison : -comparison;
    });
  }, [filteredAppointments, sortDir, sortField]);

  const appointmentStats = useMemo(
    () => ({
      total: appointments.length,
      pending: appointments.filter(({ status }) => status === "PENDING").length,
      confirmed: appointments.filter(({ status }) => status === "CONFIRMED")
        .length,
      completed: appointments.filter(({ status }) => status === "COMPLETED")
        .length,
      cancelled: appointments.filter(({ status }) => status === "CANCELLED")
        .length,
    }),
    [appointments],
  );

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDir("asc");
  }

  function openCancelDialog(appointmentId: string) {
    setSelectedAppointmentId(appointmentId);
    setCancelDialogOpen(true);
  }

  function handleCancelConfirm(reason?: string) {
    if (!selectedAppointmentId) return;

    cancelMutation.mutate(
      { id: selectedAppointmentId, reason },
      {
        onSuccess: () => {
          setCancelDialogOpen(false);
          setSelectedAppointmentId(null);
        },
      },
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeaderSkeleton />
        <StatsCardsSkeleton count={5} />
        <TableSkeleton
          rows={6}
          columns={canManage ? 7 : 6}
          isMobile={isMobile}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        Erro ao carregar consultas
      </div>
    );
  }

  const scoreSortIcon =
    sortField !== "vulnerabilityScore" ? (
      <ArrowUpDown className="h-4 w-4" />
    ) : sortDir === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Agendamentos"
        action={
          canManage
            ? {
                label: "+ Nova Consulta",
                href: "/dashboard/manager/appointments/new",
                colorClass: "bg-blue-600 hover:bg-blue-700",
              }
            : undefined
        }
      />

      {appointments.length === 0 ? (
        <EmptyState
          message="Nenhuma consulta agendada"
          actionLabel={canManage ? "Agende a primeira consulta" : undefined}
          actionHref={
            canManage ? "/dashboard/manager/appointments/new" : undefined
          }
        />
      ) : (
        <>
          {!isMobile && (
            <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-5">
              <StatCard
                label="Total"
                value={appointmentStats.total}
                icon={<Calendar className="w-8 h-8 text-blue-500 opacity-20" />}
              />
              <StatCard
                label="Pendente"
                value={appointmentStats.pending}
                valueClassName="text-yellow-600"
                icon={
                  <AlertCircle className="w-8 h-8 text-yellow-500 opacity-20" />
                }
              />
              <StatCard
                label="Confirmado"
                value={appointmentStats.confirmed}
                valueClassName="text-blue-600"
                icon={
                  <CheckCircle className="w-8 h-8 text-blue-500 opacity-20" />
                }
              />
              <StatCard
                label="Concluído"
                value={appointmentStats.completed}
                valueClassName="text-green-600"
                icon={
                  <CheckCircle className="w-8 h-8 text-green-500 opacity-20" />
                }
              />
              <StatCard
                label="Cancelado"
                value={appointmentStats.cancelled}
                valueClassName="text-red-600"
                icon={<XCircle className="w-8 h-8 text-red-500 opacity-20" />}
              />
            </div>
          )}

          <div className="mb-6 flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-card text-foreground"
              aria-label="Filtrar agendamentos por status"
            >
              <option value="">Todos os status</option>
              <option value="PENDING">Pendente</option>
              <option value="CONFIRMED">Confirmado</option>
              <option value="COMPLETED">Concluído</option>
              <option value="CANCELLED">Cancelado</option>
              <option value="NO_SHOW">Não compareceu</option>
            </select>
            {isMobile && (
              <button
                type="button"
                onClick={() => toggleSort("vulnerabilityScore")}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
              >
                Pontuação
                {scoreSortIcon}
              </button>
            )}
          </div>

          {!mounted ? (
            <div className="h-40" aria-hidden="true" />
          ) : filteredAppointments.length === 0 ? (
            <DataTableCard>
              <DataTableEmpty
                icon={<Calendar className="h-8 w-8" />}
                title="Nenhuma consulta encontrada para o filtro selecionado"
              />
            </DataTableCard>
          ) : isMobile ? (
            <MobileAppointments
              appointments={sortedAppointments}
              canManage={canManage}
              isCancelling={cancelMutation.isPending}
              onCancel={openCancelDialog}
            />
          ) : (
            <DesktopAppointments
              appointments={sortedAppointments}
              canManage={canManage}
              isCancelling={cancelMutation.isPending}
              sortField={sortField}
              sortDir={sortDir}
              onSort={toggleSort}
              onCancel={openCancelDialog}
            />
          )}
        </>
      )}

      {canManage && (
        <CancelConfirmDialog
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          onConfirm={handleCancelConfirm}
          isLoading={cancelMutation.isPending}
        />
      )}
    </div>
  );
}

function MobileAppointments({
  appointments,
  canManage,
  isCancelling,
  onCancel,
}: {
  appointments: ManagementAppointment[];
  canManage: boolean;
  isCancelling: boolean;
  onCancel: (appointmentId: string) => void;
}) {
  return (
    <DataTableCard>
      <DataTableMobileList>
        {appointments.map((appointment) => (
          <DataTableMobileItem key={appointment.id}>
            <div className="flex justify-between gap-3 items-start mb-3">
              <div className="min-w-0">
                <h3 className="font-medium text-foreground text-sm truncate">
                  {appointment.patient.name || appointment.patient.email}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {appointment.professional.name ||
                    appointment.professional.email}
                </p>
              </div>
              <StatusBadge
                status={appointment.status}
                type="appointment"
                className="shrink-0"
              />
            </div>

            <div className="mb-3">
              <VulnerabilityBadge
                totalScore={appointment.totalScore}
                isVulnerable={appointment.isVulnerable}
              />
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {new Date(appointment.dateTime).toLocaleDateString("pt-BR")}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-4 h-4" />
                {new Date(appointment.dateTime).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {(appointment.scheduledByManager?.user.name ||
              appointment.cancelledByManager) && (
              <div className="rounded p-2 mb-3 text-xs space-y-1 border border-border bg-muted/30">
                {appointment.scheduledByManager?.user.name && (
                  <p className="text-muted-foreground">
                    Agendado por:{" "}
                    <span className="font-medium text-foreground">
                      {appointment.scheduledByManager.user.name}
                    </span>
                  </p>
                )}
                {appointment.cancelledByManager && (
                  <p className="text-red-600">
                    Cancelado por:{" "}
                    <span className="font-medium">
                      {appointment.cancelledByManager.user.name}
                    </span>
                  </p>
                )}
              </div>
            )}

            {canManage && appointment.status !== "CANCELLED" && (
              <button
                type="button"
                onClick={() => onCancel(appointment.id)}
                disabled={isCancelling}
                className="w-full px-3 py-2 text-sm text-red-600 border border-red-200 hover:bg-red-50 rounded transition disabled:opacity-50"
              >
                Cancelar
              </button>
            )}
          </DataTableMobileItem>
        ))}
      </DataTableMobileList>
    </DataTableCard>
  );
}

function DesktopAppointments({
  appointments,
  canManage,
  isCancelling,
  sortField,
  sortDir,
  onSort,
  onCancel,
}: {
  appointments: ManagementAppointment[];
  canManage: boolean;
  isCancelling: boolean;
  sortField: SortField | null;
  sortDir: AppointmentSortOrder;
  onSort: (field: SortField) => void;
  onCancel: (appointmentId: string) => void;
}) {
  return (
    <DataTableCard>
      <DataTable className="min-w-[980px]">
        <DataTableHead>
          <SortableHeader
            field="patient"
            currentField={sortField}
            direction={sortDir}
            onToggle={onSort}
          >
            Paciente
          </SortableHeader>
          <SortableHeader
            field="professional"
            currentField={sortField}
            direction={sortDir}
            onToggle={onSort}
          >
            Profissional
          </SortableHeader>
          <SortableHeader
            field="vulnerabilityScore"
            currentField={sortField}
            direction={sortDir}
            onToggle={onSort}
          >
            Pontuação
          </SortableHeader>
          <SortableHeader
            field="dateTime"
            currentField={sortField}
            direction={sortDir}
            onToggle={onSort}
          >
            Data/Hora
          </SortableHeader>
          <SortableHeader
            field="scheduledBy"
            currentField={sortField}
            direction={sortDir}
            onToggle={onSort}
          >
            Agendado por
          </SortableHeader>
          <SortableHeader
            field="status"
            currentField={sortField}
            direction={sortDir}
            onToggle={onSort}
          >
            Status
          </SortableHeader>
          {canManage && <DataTableHeadCell>Ações</DataTableHeadCell>}
        </DataTableHead>
        <DataTableBody>
          {appointments.map((appointment) => (
            <DataTableRow key={appointment.id}>
              <DataTableCell className="font-medium text-foreground">
                {appointment.patient.name || appointment.patient.email}
              </DataTableCell>
              <DataTableCell>
                {appointment.professional.name || appointment.professional.email}
              </DataTableCell>
              <DataTableCell>
                <VulnerabilityBadge
                  totalScore={appointment.totalScore}
                  isVulnerable={appointment.isVulnerable}
                />
              </DataTableCell>
              <DataTableCell>
                {new Date(appointment.dateTime).toLocaleString("pt-BR")}
              </DataTableCell>
              <DataTableCell>
                <div className="space-y-1">
                  <p className="text-foreground">
                    {appointment.scheduledByManager?.user.name || "-"}
                  </p>
                  {appointment.cancelledByManager && (
                    <p className="text-xs text-red-600">
                      Cancelado por: {appointment.cancelledByManager.user.name}
                    </p>
                  )}
                </div>
              </DataTableCell>
              <DataTableCell>
                <StatusBadge status={appointment.status} type="appointment" />
              </DataTableCell>
              {canManage && (
                <DataTableCell>
                  {appointment.status !== "CANCELLED" && (
                    <button
                      type="button"
                      onClick={() => onCancel(appointment.id)}
                      disabled={isCancelling}
                      className="px-3 py-1.5 text-sm text-red-600 border border-red-200 hover:bg-red-50 rounded transition disabled:opacity-50 font-medium"
                    >
                      <X className="inline w-4 h-4 mr-1" />
                      Cancelar
                    </button>
                  )}
                </DataTableCell>
              )}
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
    </DataTableCard>
  );
}

function StatCard({
  label,
  value,
  valueClassName = "text-foreground",
  icon,
}: {
  label: string;
  value: number;
  valueClassName?: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${valueClassName}`}>{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}
