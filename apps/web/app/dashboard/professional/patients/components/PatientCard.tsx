import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { formatPhoneNumber } from "@/app/utils/formatPhone";

export interface PatientCardData {
  id: string;
  name: string;
  email: string;
  cpf: string | null;
  phone: string;
  lastVisit: string | null;
  nextVisit: string | null;
  photoUrl?: string;
}

interface PatientCardProps {
  patient: PatientCardData;
}

function formatCpf(cpf: string | null): string {
  if (!cpf) return "Não informado";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(phone: string): string {
  if (!phone || phone === "Não informado") return "Não informado";
  return formatPhoneNumber(phone);
}

export function PatientCard({ patient }: PatientCardProps) {
  const router = useRouter();

  const navigate = () =>
    router.push(`/dashboard/professional/patients/${patient.id}`);

  const nextVisitFormatted = patient.nextVisit
    ? new Date(patient.nextVisit).toLocaleDateString("pt-BR")
    : null;
  const lastVisitFormatted = patient.lastVisit
    ? new Date(patient.lastVisit).toLocaleDateString("pt-BR")
    : null;

  const renderAvatar = (name: string, photoUrl?: string) => {
    if (photoUrl) {
      return (
        <Image
          src={photoUrl}
          alt={name}
          title={`Foto de perfil de ${name}`}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover object-center border border-gray-200 bg-[#fafafa] shrink-0"
        />
      );
    }
    return (
      <div
        title={`Foto de perfil de ${name}`}
        className="w-12 h-12 rounded-full font-semibold flex items-center justify-center text-blue-700 bg-blue-50 border border-blue-100 shrink-0 text-lg"
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={navigate}
      onKeyDown={(e) => e.key === "Enter" && navigate()}
      className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col h-full cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex gap-3 items-center mb-4">
        {renderAvatar(patient.name, patient.photoUrl)}
        <div className="min-w-0 flex-1">
          <h3
            className="font-semibold text-[15px] text-gray-900 truncate"
            title={patient.name}
          >
            {patient.name}
          </h3>
          <p
            className="text-[13px] text-gray-500 truncate"
            title={patient.email}
          >
            {patient.email}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[13px] mb-5">
        <dt className="text-gray-500">CPF</dt>
        <dd className="text-gray-800 font-medium truncate" title={formatCpf(patient.cpf)}>
          {formatCpf(patient.cpf)}
        </dd>
        <dt className="text-gray-500">Telefone</dt>
        <dd className="text-gray-800 font-medium truncate" title={formatPhone(patient.phone)}>
          {formatPhone(patient.phone)}
        </dd>
        {nextVisitFormatted && (
          <>
            <dt className="text-gray-500">Próxima consulta</dt>
            <dd className="text-gray-800 font-medium truncate" title={nextVisitFormatted}>
              {nextVisitFormatted}
            </dd>
          </>
        )}
        {lastVisitFormatted && (
          <>
            <dt className="text-gray-500">Última consulta</dt>
            <dd className="text-gray-800 font-medium truncate" title={lastVisitFormatted}>
              {lastVisitFormatted}
            </dd>
          </>
        )}
        {!nextVisitFormatted && !lastVisitFormatted && (
          <>
            <dt className="text-gray-500">Consultas</dt>
            <dd className="text-gray-400 italic truncate">Nenhuma</dd>
          </>
        )}
      </dl>

      <div className="mt-auto">
        <Button
          size="sm"
          className="w-full text-xs"
          onClick={(e) => {
            e.stopPropagation();
            navigate();
          }}
          title="Abrir página do paciente para gerenciar consultas"
        >
          Gerenciar
        </Button>
      </div>
    </div>
  );
}
