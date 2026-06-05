"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { DetailPageSkeleton } from "@/components/ui/skeletons";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  useMedicalRecordByIdQuery,
  useUpdateMedicalRecordMutation,
} from "@/queries/useMedicalRecords";
import { useUserQuery } from "@/queries/useUserQuery";
import {
  MedicalRecordResponse,
} from "@/services/medical-records-service";
import { CalendarIcon } from "../../../../utils/icons";
import { PageShell } from "../../../../ui/dashboard/page-shell";

type ClinicalKey =
  | "chiefComplaint"
  | "diagnosis"
  | "treatmentPlan"
  | "prescriptions"
  | "internalNotes";

const FIELDS: {
  key: ClinicalKey;
  label: string;
  placeholder: string;
  patientHidden?: boolean;
}[] = [
  {
    key: "chiefComplaint",
    label: "Queixa principal",
    placeholder: "Motivo principal relatado pelo paciente…",
  },
  {
    key: "diagnosis",
    label: "Diagnóstico",
    placeholder: "Hipóteses ou diagnóstico confirmado…",
  },
  {
    key: "treatmentPlan",
    label: "Plano terapêutico",
    placeholder: "Plano de tratamento, condutas, orientações…",
  },
  {
    key: "prescriptions",
    label: "Prescrições",
    placeholder: "Medicações, dosagens, exames solicitados…",
  },
  {
    key: "internalNotes",
    label: "Notas internas",
    placeholder: "Observações privadas (não visíveis ao paciente)…",
    patientHidden: true,
  },
];

const EMPTY: Record<ClinicalKey, string> = {
  chiefComplaint: "",
  diagnosis: "",
  treatmentPlan: "",
  prescriptions: "",
  internalNotes: "",
};

function isFullRecord(record: unknown): record is MedicalRecordResponse {
  return (
    record !== null &&
    typeof record === "object" &&
    "internalNotes" in (record as Record<string, unknown>)
  );
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const MedicalRecordDetailsPage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const isMobile = useIsMobile();
  const { data: currentUser } = useUserQuery();
  const { data: record, isLoading } = useMedicalRecordByIdQuery(
    params?.id ?? null,
  );
  const updateMutation = useUpdateMedicalRecordMutation();

  const fullRecord = isFullRecord(record) ? record : null;
  const isAuthor = useMemo(
    () => Boolean(fullRecord && currentUser && fullRecord.author.id === currentUser.id),
    [fullRecord, currentUser],
  );

  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!fullRecord) return;
    setForm({
      chiefComplaint: fullRecord.chiefComplaint ?? "",
      diagnosis: fullRecord.diagnosis ?? "",
      treatmentPlan: fullRecord.treatmentPlan ?? "",
      prescriptions: fullRecord.prescriptions ?? "",
      internalNotes: fullRecord.internalNotes ?? "",
    });
  }, [fullRecord]);

  const hasAnyField = Object.values(form).some((v) => v.trim().length > 0);

  const handleSave = async () => {
    if (!fullRecord || !hasAnyField) return;
    const payload = {
      chiefComplaint: form.chiefComplaint.trim() || undefined,
      diagnosis: form.diagnosis.trim() || undefined,
      treatmentPlan: form.treatmentPlan.trim() || undefined,
      prescriptions: form.prescriptions.trim() || undefined,
      internalNotes: form.internalNotes.trim() || undefined,
    };
    try {
      await updateMutation.mutateAsync({ id: fullRecord.id, data: payload });
      setEditing(false);
    } catch {
      // erro tratado via toast
    }
  };

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
          onClick={() => router.push("/dashboard/professional/medical-records")}
        >
          Voltar para a lista
        </Button>
      </PageShell>
    );
  }

  const isSaving = updateMutation.isPending;

  return (
    <PageShell>
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/professional/medical-records")}
          title="Voltar para a lista"
        >
          ← Voltar
        </Button>
      </div>

      <Card className="border border-gray-200 rounded-xl bg-white mb-5">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex gap-3 items-center min-w-0">
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-semibold text-lg shrink-0">
                {(fullRecord?.patient?.name ?? "P").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1
                  className={`font-bold text-slate-900 tracking-tight truncate ${isMobile ? "text-lg" : "text-xl"}`}
                  title={fullRecord?.patient?.name ?? "Paciente"}
                >
                  {fullRecord?.patient?.name ?? "Paciente"}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">Prontuário</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {isAuthor && !editing && (
                <Button onClick={() => setEditing(true)} title="Editar prontuário">
                  Editar
                </Button>
              )}
              {!isAuthor && (
                <Badge className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 text-xs rounded">
                  Somente leitura
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2 text-slate-600">
              <CalendarIcon size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] uppercase text-slate-400 tracking-wide font-medium">
                  Consulta
                </p>
                <p className="text-slate-800">
                  {fullRecord?.appointment
                    ? formatDateTime(fullRecord.appointment.dateTime)
                    : formatDateTime(record.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-slate-600">
              <div className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center text-[11px] font-bold text-slate-400">
                ✎
              </div>
              <div>
                <p className="text-[11px] uppercase text-slate-400 tracking-wide font-medium">
                  Autor
                </p>
                <p className="text-slate-800">{record.author.name}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 rounded-xl bg-white">
        <CardContent className="p-5 sm:p-6 flex flex-col gap-5">
          {FIELDS.map((field) => {
            const value = form[field.key];
            const display = fullRecord?.[field.key] ?? null;

            if (editing && isAuthor) {
              return (
                <div key={field.key} className="flex flex-col gap-1.5">
                  <label
                    htmlFor={`mr-${field.key}`}
                    className="text-sm font-medium text-slate-700"
                  >
                    {field.label}
                    {field.patientHidden && (
                      <span className="ml-2 text-[11px] font-normal text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                        Não visível ao paciente
                      </span>
                    )}
                  </label>
                  <textarea
                    id={`mr-${field.key}`}
                    placeholder={field.placeholder}
                    value={value}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    disabled={isSaving}
                    className="w-full min-h-24 p-3 resize-y rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[14.5px] leading-relaxed placeholder:text-slate-400 shadow-sm transition-all duration-200 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/20"
                  />
                </div>
              );
            }

            return (
              <div key={field.key} className="flex flex-col gap-1">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  {field.label}
                  {field.patientHidden && (
                    <span className="ml-2 normal-case font-normal text-amber-700">
                      (não visível ao paciente)
                    </span>
                  )}
                </p>
                <p className="text-[14.5px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {display ?? (
                    <span className="text-slate-300 italic">Não informado</span>
                  )}
                </p>
              </div>
            );
          })}

          {editing && isAuthor && (
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setEditing(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasAnyField || isSaving}
                title="Salvar alterações"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" /> Salvando…
                  </span>
                ) : (
                  "Salvar alterações"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
};

export default MedicalRecordDetailsPage;
