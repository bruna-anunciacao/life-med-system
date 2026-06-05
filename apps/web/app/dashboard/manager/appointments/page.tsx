'use client';

import { useState, useMemo } from 'react';
import { useListAppointmentsQuery } from '@/queries/useListAppointmentsQuery';
import { useCancelAppointmentManagerMutation } from '@/queries/useCancelAppointmentManagerMutation';
import { useIsMobile } from '@/hooks/useIsMobile';
import { StatsCardsSkeleton, TableSkeleton, PageHeaderSkeleton } from '@/components/ui/skeletons';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader as SharedPageHeader } from '@/components/shared/PageHeader';
import { PageShell } from '../../../ui/dashboard/page-shell';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CancelConfirmDialog } from '@/app/dashboard/patient/appointments/components/CancelConfirmDialog';
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
} from '@/components/ui/data-table';
import { Calendar, Clock, X, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

type SortField = 'patient' | 'professional' | 'dateTime' | 'scheduledBy' | 'status';
type SortDir = 'asc' | 'desc';

export default function AppointmentsPage() {
  const isMobile = useIsMobile();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: appointments = [], isLoading, error } = useListAppointmentsQuery();
  const cancelMutation = useCancelAppointmentManagerMutation();

  const filteredAppointments = useMemo(() => {
    if (!statusFilter) return appointments;
    return appointments.filter((apt: any) => apt.status === statusFilter);
  }, [appointments, statusFilter]);

  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function getSortValue(apt: any, field: SortField): string {
    switch (field) {
      case 'patient':
        return apt.patient?.name ?? apt.patient?.email ?? '';
      case 'professional':
        return apt.professional?.name ?? apt.professional?.email ?? '';
      case 'dateTime':
        return apt.dateTime ?? '';
      case 'scheduledBy':
        return apt.scheduledByManager?.user?.name ?? '';
      case 'status':
        return apt.status ?? '';
    }
  }

  const sortedAppointments = useMemo(() => {
    if (!sortField) return filteredAppointments;
    return [...filteredAppointments].sort((a: any, b: any) => {
      const cmp = getSortValue(a, sortField).localeCompare(getSortValue(b, sortField));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredAppointments, sortField, sortDir]);

  const appointmentStats = useMemo(() => {
    return {
      total: appointments.length,
      pending: appointments.filter((apt: any) => apt.status === 'PENDING').length,
      confirmed: appointments.filter((apt: any) => apt.status === 'CONFIRMED').length,
      completed: appointments.filter((apt: any) => apt.status === 'COMPLETED').length,
      cancelled: appointments.filter((apt: any) => apt.status === 'CANCELLED').length,
    };
  }, [appointments]);

  const handleCancelClick = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = (reason?: string) => {
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
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="max-w-7xl mx-auto">
          <PageHeaderSkeleton />
          <StatsCardsSkeleton count={4} />
          <TableSkeleton rows={6} columns={6} isMobile={isMobile} />
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Erro ao carregar consultas
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto">
        <SharedPageHeader
          title="Agendamentos"
          action={{
            label: '+ Nova Consulta',
            href: '/dashboard/manager/appointments/new',
            colorClass: 'bg-blue-600 hover:bg-blue-700',
          }}
        />

        {appointments.length === 0 ? (
          <EmptyState
            message="Nenhuma consulta agendada"
            actionLabel="Agende a primeira consulta"
            actionHref="/dashboard/manager/appointments/new"
          />
        ) : (
          <>
            {!isMobile && (
              <div className="grid grid-cols-5 gap-4 mb-8">
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Total</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{appointmentStats.total}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-500 opacity-20" />
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Pendente</p>
                      <p className="text-2xl font-bold text-yellow-600 mt-1">{appointmentStats.pending}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-yellow-500 opacity-20" />
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Confirmado</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">{appointmentStats.confirmed}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-blue-500 opacity-20" />
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Concluído</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">{appointmentStats.completed}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500 opacity-20" />
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Cancelado</p>
                      <p className="text-2xl font-bold text-red-600 mt-1">{appointmentStats.cancelled}</p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-500 opacity-20" />
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6 flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-card text-foreground"
              >
                <option value="">Todos os status</option>
                <option value="PENDING">Pendente</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="COMPLETED">Concluído</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>

            {filteredAppointments.length === 0 ? (
              <DataTableCard>
                <DataTableEmpty
                  icon={<Calendar className="h-8 w-8" />}
                  title={
                    statusFilter
                      ? `Nenhuma consulta com status "${statusFilter}"`
                      : 'Nenhuma consulta encontrada'
                  }
                />
              </DataTableCard>
            ) : isMobile ? (
              <DataTableCard>
                <DataTableMobileList>
                  {sortedAppointments.map((appointment: any) => (
                    <DataTableMobileItem key={appointment.id}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="min-w-0">
                          <h3 className="font-medium text-foreground text-sm truncate">
                            {appointment.patient?.name ||
                              appointment.patient?.email ||
                              'Paciente'}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {appointment.professional?.name ||
                              appointment.professional?.email ||
                              'Profissional'}
                          </p>
                        </div>
                        <StatusBadge
                          status={appointment.status || 'PENDING'}
                          type="appointment"
                        />
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {new Date(appointment.dateTime).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {new Date(appointment.dateTime).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      {(appointment.scheduledByManager?.user?.name ||
                        appointment.cancelledByManager) && (
                        <div className="rounded p-2 mb-3 text-xs space-y-1 border border-border bg-muted/30">
                          {appointment.scheduledByManager?.user?.name && (
                            <p className="text-muted-foreground">
                              Agendado por:{' '}
                              <span className="font-medium text-foreground">
                                {appointment.scheduledByManager.user.name}
                              </span>
                            </p>
                          )}
                          {appointment.cancelledByManager && (
                            <p className="text-red-600">
                              Cancelado por:{' '}
                              <span className="font-medium">
                                {appointment.cancelledByManager.user?.name}
                              </span>
                            </p>
                          )}
                        </div>
                      )}

                      {appointment.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleCancelClick(appointment.id)}
                          disabled={cancelMutation.isPending}
                          className="w-full px-3 py-2 text-sm text-red-600 border border-red-200 hover:bg-red-50 rounded transition disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      )}
                    </DataTableMobileItem>
                  ))}
                </DataTableMobileList>
              </DataTableCard>
            ) : (
              <DataTableCard>
                <DataTable>
                  <DataTableHead>
                    <SortableHeader field="patient" currentField={sortField} direction={sortDir} onToggle={toggleSort}>
                      Paciente
                    </SortableHeader>
                    <SortableHeader field="professional" currentField={sortField} direction={sortDir} onToggle={toggleSort}>
                      Profissional
                    </SortableHeader>
                    <SortableHeader field="dateTime" currentField={sortField} direction={sortDir} onToggle={toggleSort}>
                      Data/Hora
                    </SortableHeader>
                    <SortableHeader field="scheduledBy" currentField={sortField} direction={sortDir} onToggle={toggleSort}>
                      Agendado por
                    </SortableHeader>
                    <SortableHeader field="status" currentField={sortField} direction={sortDir} onToggle={toggleSort}>
                      Status
                    </SortableHeader>
                    <DataTableHeadCell>Ações</DataTableHeadCell>
                  </DataTableHead>
                  <DataTableBody>
                    {sortedAppointments.map((appointment: any) => (
                      <DataTableRow key={appointment.id}>
                        <DataTableCell className="font-medium text-foreground">
                          {appointment.patient?.name ||
                            appointment.patient?.email ||
                            '-'}
                        </DataTableCell>
                        <DataTableCell>
                          {appointment.professional?.name ||
                            appointment.professional?.email ||
                            '-'}
                        </DataTableCell>
                        <DataTableCell>
                          {new Date(appointment.dateTime).toLocaleString('pt-BR')}
                        </DataTableCell>
                        <DataTableCell>
                          <div className="space-y-1">
                            <p className="text-foreground">
                              {appointment.scheduledByManager?.user?.name || '-'}
                            </p>
                            {appointment.cancelledByManager && (
                              <p className="text-xs text-red-600">
                                Cancelado por:{' '}
                                {appointment.cancelledByManager.user?.name}
                              </p>
                            )}
                          </div>
                        </DataTableCell>
                        <DataTableCell>
                          <StatusBadge
                            status={appointment.status || 'PENDING'}
                            type="appointment"
                          />
                        </DataTableCell>
                        <DataTableCell>
                          {appointment.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleCancelClick(appointment.id)}
                              disabled={cancelMutation.isPending}
                              className="px-3 py-1.5 text-sm text-red-600 border border-red-200 hover:bg-red-50 rounded transition disabled:opacity-50 font-medium"
                            >
                              <X className="inline w-4 h-4 mr-1" />
                              Cancelar
                            </button>
                          )}
                        </DataTableCell>
                      </DataTableRow>
                    ))}
                  </DataTableBody>
                </DataTable>
              </DataTableCard>
            )}
          </>
        )}
      </div>

      <CancelConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancelConfirm}
        isLoading={cancelMutation.isPending}
      />
    </PageShell>
  );
}
