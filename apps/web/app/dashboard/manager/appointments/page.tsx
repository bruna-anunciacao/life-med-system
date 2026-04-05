'use client';

import { useListAppointmentsQuery } from '@/queries/useListAppointmentsQuery';
import { LoadingPage } from '@/components/shared/LoadingPage';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function AppointmentsPage() {
  const { data: appointments = [], isLoading, error } = useListAppointmentsQuery();

  if (isLoading) {
    return <LoadingPage message="Carregando consultas..." />;
  }

  if (error) {
    return (
      <div className="py-12 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Erro ao carregar consultas
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Consultas"
          action={{ label: "+ Nova Consulta", href: "/dashboard/manager/appointments/new", colorClass: "bg-blue-600 hover:bg-blue-700" }}
        />

        {appointments.length === 0 ? (
          <EmptyState
            message="Nenhuma consulta agendada"
            actionLabel="Agende a primeira consulta"
            actionHref="/dashboard/manager/appointments/new"
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Paciente</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Profissional</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Data/Hora</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment: any) => (
                  <tr key={appointment.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {appointment.patient?.name || appointment.patient?.email || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {appointment.professional?.name || appointment.professional?.email || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(appointment.dateTime).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge status={appointment.status || 'PENDING'} type="appointment" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
