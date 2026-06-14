"use client";

import { useMemo, useState, type ReactNode } from "react";
import Fuse from "fuse.js";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  Clock,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";
import { CancelConfirmDialog } from "@/app/dashboard/patient/appointments/components/CancelConfirmDialog";
import { PageHeader } from "@/app/ui/dashboard/page-shell";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { VulnerabilityBadge } from "@/components/shared/VulnerabilityBadge";
import { SearchInput } from "@/components/ui/search-input";
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
  DataTablePagination,
  DataTableRow,
  SortableHeader,
} from "@/components/ui/data-table";
import { usePagination } from "@/hooks/usePagination";
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
  const [searchTerm, setSearchTerm] = useState("");
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

  const fuse = useMemo(
    () =>
      new Fuse(appointments, {
        keys: ["patient.name", "professional.name"],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [appointments],
  );

  const searchedAppointments = useMemo(() => {
    if (!searchTerm.trim()) return appointments;
    return fuse.search(searchTerm).map((result) => result.item);
  }, [appointments, fuse, searchTerm]);

  const filteredAppointments = useMemo(() => {
    if (!statusFilter) return searchedAppointments;
    return searchedAppointments.filter(
      (appointment) => appointment.status === statusFilter,
    );
  }, [searchedAppointments, statusFilter]);

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

  const pagination = usePagination(sortedAppointments, {
    initialPageSize: 10,
    resetKeys: [statusFilter, searchTerm, sortField, sortDir],
  });

  const paginationFooter = (
    <DataTablePagination
      page={pagination.page}
      totalPages={pagination.totalPages}
      from={pagination.from}
      to={pagination.to}
      totalItems={pagination.totalItems}
      hasPrev={pagination.hasPrev}
      hasNext={pagination.hasNext}
      onPageChange={pagination.setPage}
      pageSize={pagination.pageSize}
      onPageSizeChange={pagination.setPageSize}
      itemLabel="consultas"
    />
  );

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
      <div className="w-full">
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
    <div className="w-full">
      <PageHeader
        title="Agendamentos"
        actions={
          canManage ? (
            <Link
              href="/dashboard/manager/appointments/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-sm hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" />
              Nova Consulta
            </Link>
          ) : undefined
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
              <StatCard label="Total" value={appointmentStats.total} />
              <StatCard
                label="Pendente"
                value={appointmentStats.pending}
                valueClassName="text-yellow-600"
              />
              <StatCard
                label="Confirmado"
                value={appointmentStats.confirmed}
                valueClassName="text-blue-600"
              />
              <StatCard
                label="Concluído"
                value={appointmentStats.completed}
                valueClassName="text-green-600"
              />
              <StatCard
                label="Cancelado"
                value={appointmentStats.cancelled}
                valueClassName="text-red-600"
              />
            </div>
          )}

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <SearchInput
                placeholder="Buscar por paciente ou profissional..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-10 rounded-xl shadow-sm"
                aria-label="Buscar por paciente ou profissional"
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:shrink-0">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground shadow-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm text-foreground shadow-sm"
                >
                  Pontuação
                  {scoreSortIcon}
                </button>
              )}
            </div>
          </div>

          {searchTerm && (
            <p className="-mt-3 mb-6 text-xs text-muted-foreground">
              {filteredAppointments.length}{" "}
              {filteredAppointments.length === 1 ? "resultado" : "resultados"}{" "}
              para{" "}
              <span className="font-medium text-foreground">
                &quot;{searchTerm}&quot;
              </span>
            </p>
          )}

          {!mounted ? (
            <div className="h-40" aria-hidden="true" />
          ) : filteredAppointments.length === 0 ? (
            <DataTableCard>
              <DataTableEmpty
                icon={<Calendar className="h-8 w-8" />}
                title={
                  searchTerm
                    ? `Nenhuma consulta encontrada para "${searchTerm}"`
                    : "Nenhuma consulta encontrada para o filtro selecionado"
                }
              />
            </DataTableCard>
          ) : isMobile ? (
            <MobileAppointments
              appointments={pagination.pageItems}
              canManage={canManage}
              isCancelling={cancelMutation.isPending}
              onCancel={openCancelDialog}
              footer={paginationFooter}
            />
          ) : (
            <DesktopAppointments
              appointments={pagination.pageItems}
              canManage={canManage}
              isCancelling={cancelMutation.isPending}
              sortField={sortField}
              sortDir={sortDir}
              onSort={toggleSort}
              onCancel={openCancelDialog}
              footer={paginationFooter}
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
  footer,
}: {
  appointments: ManagementAppointment[];
  canManage: boolean;
  isCancelling: boolean;
  onCancel: (appointmentId: string) => void;
  footer?: ReactNode;
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
      {footer}
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
  footer,
}: {
  appointments: ManagementAppointment[];
  canManage: boolean;
  isCancelling: boolean;
  sortField: SortField | null;
  sortDir: AppointmentSortOrder;
  onSort: (field: SortField) => void;
  onCancel: (appointmentId: string) => void;
  footer?: ReactNode;
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
      {footer}
    </DataTableCard>
  );
}
