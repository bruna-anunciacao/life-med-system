'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Fuse from 'fuse.js';
import { useListPatientsQuery } from '@/queries/useListPatientsQuery';
import { useIsMobile, useMounted } from '@/hooks/useIsMobile';
import Link from 'next/link';
import { StatsCardsSkeleton, TableSkeleton, PageHeaderSkeleton } from '@/components/ui/skeletons';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageShell, PageHeader } from '../../../ui/dashboard/page-shell';
import { formatPhoneNumber } from '@/app/utils/formatPhone';
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
} from '@/components/ui/data-table';
import { usePagination } from '@/hooks/usePagination';
import {
  Plus,
  Users,
  ClipboardCheck,
  ClipboardList,
} from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import { StatCard } from '@/components/shared/StatCard';

type SortField = 'name' | 'email' | 'phone' | 'dateOfBirth' | 'gender' | 'questionnaire';
type SortDir = 'asc' | 'desc';

type Patient = {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  status?: string;
  patientProfile?: {
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    questionnaireCompleted?: boolean;
    questionnaire?: { id: string } | null;
  };
};

const formatLocalDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString.split('T')[0] + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
};

export default function PatientsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const mounted = useMounted();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') ?? '';

  const { data: patients = [], isLoading, error } = useListPatientsQuery();

  const fuse = useMemo(
    () =>
      new Fuse(patients as Patient[], {
        keys: ['name'],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [patients],
  );

  const filteredPatients: Patient[] = useMemo(() => {
    if (!searchTerm.trim()) return patients as Patient[];
    return fuse.search(searchTerm).map((r) => r.item);
  }, [searchTerm, fuse, patients]);

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

  function getSortValue(p: Patient, field: SortField): string {
    switch (field) {
      case 'name':
        return p.name ?? '';
      case 'email':
        return p.email ?? '';
      case 'phone':
        return p.patientProfile?.phone ?? '';
      case 'dateOfBirth':
        return p.patientProfile?.dateOfBirth ?? '';
      case 'gender':
        return p.patientProfile?.gender ?? '';
      case 'questionnaire':
        return p.patientProfile?.questionnaire ? '1' : '0';
    }
  }

  const stats = useMemo(() => {
    const list = patients as Patient[];
    const total = list.length;
    const active = list.filter((p) => !p.status || p.status === 'VERIFIED').length;
    const withQuestionnaire = list.filter((p) => Boolean(p.patientProfile?.questionnaire)).length;
    const withoutQuestionnaire = total - withQuestionnaire;
    return { total, active, withQuestionnaire, withoutQuestionnaire };
  }, [patients]);

  const sortedPatients = useMemo(() => {
    if (!sortField) return filteredPatients;
    return [...filteredPatients].sort((a, b) => {
      const cmp = getSortValue(a, sortField).localeCompare(getSortValue(b, sortField));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredPatients, sortField, sortDir]);

  const pagination = usePagination(sortedPatients, {
    initialPageSize: 10,
    resetKeys: [searchTerm, sortField, sortDir],
  });

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
    return (
      <PageShell>
        <PageHeaderSkeleton />
        <StatsCardsSkeleton count={4} />
        <div className="mb-6">
          <div className="h-12 w-full rounded-xl bg-muted animate-pulse" />
        </div>
        <TableSkeleton rows={6} columns={7} isMobile={isMobile} />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Erro ao carregar pacientes
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Pacientes"
        actions={
          <Link
            href="/dashboard/manager/patients/new"
            title="Abrir formulário para cadastrar um novo paciente"
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-sm transition-colors hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            Novo Paciente
          </Link>
        }
      />

      {patients.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <StatCard label="Total" value={stats.total} />
            <StatCard
              label="Ativos"
              value={stats.active}
              valueClassName="text-emerald-600"
            />
            <StatCard
              label="Com questionário"
              value={stats.withQuestionnaire}
              valueClassName="text-blue-600"
            />
            <StatCard
              label="Sem questionário"
              value={stats.withoutQuestionnaire}
              valueClassName="text-amber-600"
            />
          </div>
        )}

        <div className="mb-6">
          <SearchInput
            placeholder="Buscar paciente por nome..."
            defaultValue={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-12 shadow-sm rounded-xl"
            aria-label="Buscar paciente por nome"
          />
          {searchTerm && (
            <p className="mt-2 text-xs text-muted-foreground">
              {filteredPatients.length}{' '}
              {filteredPatients.length === 1 ? 'resultado' : 'resultados'} para{' '}
              <span className="font-medium text-foreground">&quot;{searchTerm}&quot;</span>
            </p>
          )}
        </div>

        {!mounted ? (
          <div className="h-40" aria-hidden="true" />
        ) : filteredPatients.length === 0 ? (
          searchTerm ? (
            <DataTableCard>
              <DataTableEmpty
                icon={<Users className="h-8 w-8" />}
                title={`Nenhum paciente encontrado para "${searchTerm}"`}
              />
            </DataTableCard>
          ) : (
            <EmptyState
              message="Nenhum paciente cadastrado"
              actionLabel="Cadastre o primeiro paciente"
              actionHref="/dashboard/manager/patients/new"
            />
          )
        ) : isMobile ? (
          <DataTableCard>
            <DataTableMobileList>
              {pagination.pageItems.map((patient) => (
                <DataTableMobileItem
                  key={patient.id}
                  onClick={() => router.push(`/dashboard/manager/patients/${patient.id}`)}
                  title={`Ver detalhes de ${patient.name}`}
                >
                  <div className="flex gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">
                        {patient.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">{patient.email}</p>
                    </div>
                    {patient.patientProfile?.questionnaire ? (
                      <span className="inline-flex items-center gap-1 self-start rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-[10px] font-medium flex-shrink-0">
                        <ClipboardCheck className="w-3 h-3" />
                        Respondido
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 self-start rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-[10px] font-medium flex-shrink-0">
                        <ClipboardList className="w-3 h-3" />
                        Pendente
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {patient.patientProfile?.phone && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Tel:</span> {patient.patientProfile.phone}
                      </p>
                    )}
                    {patient.patientProfile?.dateOfBirth && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Nascimento:</span>{' '}
                        {new Date(patient.patientProfile.dateOfBirth).toLocaleDateString(
                          'pt-BR',
                        )}
                      </p>
                    )}
                  </div>
                </DataTableMobileItem>
              ))}
            </DataTableMobileList>
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
              itemLabel="pacientes"
            />
          </DataTableCard>
        ) : (
          <DataTableCard className="overflow-x-auto">
            <DataTable>
              <DataTableHead>
                <SortableHeader field="name" currentField={sortField} direction={sortDir} onToggle={toggleSort}>
                  Nome
                </SortableHeader>
                <SortableHeader field="email" currentField={sortField} direction={sortDir} onToggle={toggleSort}>
                  Email
                </SortableHeader>
                <SortableHeader field="phone" currentField={sortField} direction={sortDir} onToggle={toggleSort}>
                  Telefone
                </SortableHeader>
                <SortableHeader field="dateOfBirth" currentField={sortField} direction={sortDir} onToggle={toggleSort}>
                  Data de Nascimento
                </SortableHeader>
                <SortableHeader field="gender" currentField={sortField} direction={sortDir} onToggle={toggleSort}>
                  Gênero
                </SortableHeader>
                <SortableHeader field="questionnaire" currentField={sortField} direction={sortDir} onToggle={toggleSort}>
                  Questionário
                </SortableHeader>
                <DataTableHeadCell>Ações</DataTableHeadCell>
              </DataTableHead>
              <DataTableBody>
                {pagination.pageItems.map((patient) => (
                  <DataTableRow key={patient.id}>
                    <DataTableCell>
                      <span className="font-medium text-foreground">{patient.name}</span>
                    </DataTableCell>
                    <DataTableCell>{patient.email}</DataTableCell>
                    <DataTableCell>
                      {formatPhoneNumber(patient.patientProfile?.phone) || '-'}
                    </DataTableCell>
                    <DataTableCell>
                      {patient.patientProfile?.dateOfBirth
                        ? formatLocalDate(patient.patientProfile.dateOfBirth)
                        : '-'}
                    </DataTableCell>
                    <DataTableCell>
                      {patient.patientProfile?.gender ?? '-'}
                    </DataTableCell>
                    <DataTableCell>
                      {patient.patientProfile?.questionnaire ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-xs font-medium">
                          <ClipboardCheck className="w-3 h-3" />
                          Respondido
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-xs font-medium">
                          <ClipboardList className="w-3 h-3" />
                          Pendente
                        </span>
                      )}
                    </DataTableCell>
                    <DataTableCell>
                      <Link
                        href={`/dashboard/manager/patients/${patient.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium transition"
                      >
                        Ver Detalhes
                      </Link>
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
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
              itemLabel="pacientes"
            />
          </DataTableCard>
        )}
    </PageShell>
  );
}