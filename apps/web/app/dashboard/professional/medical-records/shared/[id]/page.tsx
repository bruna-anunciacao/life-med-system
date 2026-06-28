"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DetailPageSkeleton } from "@/components/ui/skeletons";
import { useMedicalRecordByIdQuery } from "@/queries/useMedicalRecords";
import { CalendarIcon } from "../../../../../utils/icons";
import { PageShell } from "../../../../../ui/dashboard/page-shell";
import type { MedicalRecordResponse } from "@/services/medical-records-service";

const FIELDS: { key: keyof MedicalRecordResponse; label: string }[] = [
  { key: "chiefComplaint", label: "Queixa principal" },
  { key: "diagnosis", label: "Diagnóstico" },
  { key: "treatmentPlan", label: "Plano terapêutico" },
  { key: "prescriptions", label: "Prescrições" },
];

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SharedMedicalRecordPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data: record, isLoading } = useMedicalRecordByIdQuery(params?.id ?? null);

  if (isLoading) {
    return (
      <PageShell>
        <DetailPageSkeleton />
      </PageShell>
    );
  }

  if (!record) {
    return (
      <PageShell>
        <p className="text-base text-slate-700">Prontuário não encontrado.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/dashboard/professional/medical-records?view=shared")}
        >
          Voltar
        </Button>
      </PageShell>
    );
  }

  const full = record as MedicalRecordResponse;

  return (
    <PageShell>
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/professional/medical-records?view=shared")}
        >
          ← Voltar
        </Button>
        <Badge className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 text-xs rounded-full">
          Visualização — somente leitura
        </Badge>
      </div>

      <Card className="border border-gray-200 rounded-xl bg-white mb-5">
        <CardContent className="p-5 sm:p-6">
          <div className="flex gap-3 items-center min-w-0">
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-semibold text-lg shrink-0">
              {(full.patient?.name ?? "P").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-xl text-slate-900 tracking-tight truncate">
                {full.patient?.name ?? "Paciente"}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">Prontuário</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2 text-slate-600">
              <CalendarIcon size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] uppercase text-slate-400 tracking-wide font-medium">Consulta</p>
                <p className="text-slate-800">
                  {full.appointment
                    ? formatDateTime(full.appointment.dateTime)
                    : formatDateTime(full.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-slate-600">
              <div className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center text-[11px] font-bold text-slate-400">✎</div>
              <div>
                <p className="text-[11px] uppercase text-slate-400 tracking-wide font-medium">Registrado por</p>
                <p className="text-slate-800 font-medium">{full.author.name}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 rounded-xl bg-white">
        <CardContent className="p-5 sm:p-6 flex flex-col gap-5">
          {FIELDS.map((field) => {
            const value = full[field.key] as string | null;
            return (
              <div key={field.key} className="flex flex-col gap-1">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  {field.label}
                </p>
                <p className="text-[14.5px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {value ?? (
                    <span className="text-slate-300 italic">Não informado</span>
                  )}
                </p>
              </div>
            );
          })}

          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-400 italic">
              As notas internas do profissional não são exibidas nesta visualização.
            </p>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
