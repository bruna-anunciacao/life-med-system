'use client';

import { useState, useMemo } from 'react';
import { useListAppointmentsQuery } from '@/queries/useListAppointmentsQuery';
import { useCancelAppointmentManagerMutation } from '@/queries/useCancelAppointmentManagerMutation';
import { useIsMobile } from '@/hooks/useIsMobile';
import { LoadingPage } from '@/components/shared/LoadingPage';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CancelConfirmDialog } from '@/app/dashboard/patient/appointments/components/CancelConfirmDialog';
import { Calendar, Clock, X } from 'lucide-react';

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
    return <LoadingPage message="Carregando consultas..." />;
  }

  if (error) {
    return (
      <div className={`${isMobile ? 'p-4' : 'py-12 px-8'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            Erro ao carregar consultas
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'p-4 pb-20' : 'py-12 px-8'}`}>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Agendamentos"
          action={{
            label: "+ Nova Consulta",
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
              <div className="mb-6 flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os status</option>
                  <option value="PENDING">Pendente</option>
                  <option value="CONFIRMED">Confirmado</option>
                  <option value="COMPLETED">Concluído</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>
            )}

            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {statusFilter
                    ? `Nenhuma consulta com status "${statusFilter}"`
                    : 'Nenhuma consulta encontrada'}
                </p>
              </div>
            ) : isMobile ? (
              <div className="space-y-3">
                {filteredAppointments.map((appointment: any) => (
                  <div
                    key={appointment.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">
                          {appointment.patient?.name ||
                            appointment.patient?.email ||
                            'Paciente'}
                        </h3>
                        <p className="text-xs text-gray-500">
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
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(appointment.dateTime).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="w-4 h-4" />
                        {new Date(appointment.dateTime).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>

                    {(appointment.scheduledByManager?.user?.name ||
                      appointment.cancelledByManager) && (
                      <div className="bg-slate-50 rounded p-2 mb-3 text-xs space-y-1 border border-gray-200">
                        {appointment.scheduledByManager?.user?.name && (
                          <p className="text-gray-600">
                            Agendado por:{' '}
                            <span className="font-medium">
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Paciente
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Profissional
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Data/Hora
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Agendado por
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAppointments.map((appointment: any) => (
                      <tr key={appointment.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {appointment.patient?.name ||
                            appointment.patient?.email ||
                            '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {appointment.professional?.name ||
                            appointment.professional?.email ||
                            '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(appointment.dateTime).toLocaleString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="space-y-1">
                            <p className="text-gray-900">
                              {appointment.scheduledByManager?.user?.name || '-'}
                            </p>
                            {appointment.cancelledByManager && (
                              <p className="text-xs text-red-600">
                                Cancelado por:{' '}
                                {appointment.cancelledByManager.user?.name}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <StatusBadge
                            status={appointment.status || 'PENDING'}
                            type="appointment"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm">
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
    </div>
  );
}
