'use client';

import { useListPatientsQuery } from '@/queries/useListPatientsQuery';
import Link from 'next/link';
import { LoadingPage } from '@/components/shared/LoadingPage';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatPhoneNumber } from '@/app/utils/formatPhone';

export default function PatientsPage() {
  const { data: patients = [], isLoading, error } = useListPatientsQuery();

  if (isLoading) {
    return <LoadingPage message="Carregando pacientes..." />;
  }

  if (error) {
    return (
      <div className="py-12 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Erro ao carregar pacientes
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Pacientes"
          action={{ label: "+ Novo Paciente", href: "/dashboard/manager/patients/new", colorClass: "bg-green-600 hover:bg-green-700" }}
        />

        {patients.length === 0 ? (
          <EmptyState
            message="Nenhum paciente cadastrado"
            actionLabel="Cadastre o primeiro paciente"
            actionHref="/dashboard/manager/patients/new"
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nome Completo</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Telefone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Data de Nascimento</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Gênero</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient: { id: string; name: string; email: string; patientProfile?: { phone?: string; dateOfBirth?: string; gender?: string } }) => (
                  <tr key={patient.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{patient.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{patient.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatPhoneNumber(patient.patientProfile?.phone) || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {patient.patientProfile?.dateOfBirth
                        ? new Date(patient.patientProfile.dateOfBirth).toLocaleDateString('pt-BR')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {patient.patientProfile?.gender || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/dashboard/manager/patients/${patient.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Ver Detalhes
                      </Link>
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
