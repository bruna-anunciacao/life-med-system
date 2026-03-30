'use client';

import { useListPatientsQuery } from '@/queries/useListPatientsQuery';
import Link from 'next/link';

export default function PatientsPage() {
  const { data: patients = [], isLoading, error } = useListPatientsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Carregando pacientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Erro ao carregar pacientes
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
          <Link
            href="/dashboard/gestor/patients/new"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            + Novo Paciente
          </Link>
        </div>

        {patients.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">Nenhum paciente cadastrado</p>
            <Link
              href="/dashboard/gestor/patients/new"
              className="text-blue-600 hover:underline"
            >
              Cadastre o paciente
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>

                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Nome Completo
                  </th>

                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Data de Nascimento
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Gênero
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient: any) => (
                  <tr key={patient.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {patient.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {patient.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {patient.patientProfile?.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {patient.patientProfile?.dateOfBirth
                        ? new Date(
                            patient.patientProfile.dateOfBirth
                          ).toLocaleDateString('pt-BR')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {patient.patientProfile?.gender || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/dashboard/gestor/patients/${patient.id}`}
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
