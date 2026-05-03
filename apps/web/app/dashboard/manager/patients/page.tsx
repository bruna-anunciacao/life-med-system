'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Fuse from 'fuse.js';
import { useListPatientsQuery } from '@/queries/useListPatientsQuery';
import Link from 'next/link';
import { LoadingPage } from '@/components/shared/LoadingPage';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';

type Patient = {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  patientProfile?: {
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
  };
};

export default function PatientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') ?? '';

  const { data: patients = [], isLoading, error } = useListPatientsQuery();

  const fuse = useMemo(
    () =>
      new Fuse(patients as Patient[], {
        keys: ['name', 'cpf', 'email'],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [patients],
  );

  const filteredPatients: Patient[] = useMemo(() => {
    if (!searchTerm.trim()) return patients as Patient[];
    return fuse.search(searchTerm).map((r) => r.item);
  }, [searchTerm, fuse, patients]);

  function handleSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    router.replace(`?${params.toString()}`);
  }

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

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            defaultValue={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full max-w-sm border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {filteredPatients.length === 0 ? (
          searchTerm ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              Nenhum paciente encontrado para &quot;{searchTerm}&quot;
            </div>
          ) : (
            <EmptyState
              message="Nenhum paciente cadastrado"
              actionLabel="Cadastre o primeiro paciente"
              actionHref="/dashboard/manager/patients/new"
            />
          )
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
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{patient.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{patient.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {patient.patientProfile?.phone || '-'}
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
