"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  useCreateMedicalRecordMutation,
  useMedicalRecordByAppointmentQuery,
} from "@/queries/useMedicalRecords";
import { PageShell, PageHeader } from "../../../../ui/dashboard/page-shell";

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

const NewMedicalRecordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  const patientName = searchParams.get("patientName") ?? "Paciente";

  const { data: existing, isLoading } = useMedicalRecordByAppointmentQuery(
    appointmentId,
  );
  const createMutation = useCreateMedicalRecordMutation();

  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (existing && "id" in existing) {
      router.replace(
        `/dashboard/professional/medical-records/${existing.id}`,
      );
    }
  }, [existing, router]);

  if (!appointmentId) {
    return (
      <PageShell>
        <p className="text-base text-slate-700">
          Consulta não informada. Volte para a agenda e selecione uma consulta.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/dashboard/professional/schedule")}
        >
          Ir para agenda
        </Button>
      </PageShell>
    );
  }

  if (isLoading) {
    return (
      <PageShell className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </PageShell>
    );
  }

  const hasAnyField = Object.values(form).some((v) => v.trim().length > 0);
  const isSaving = createMutation.isPending;

  const handleSave = async () => {
    if (!hasAnyField) return;
    const payload = {
      appointmentId,
      chiefComplaint: form.chiefComplaint.trim() || undefined,
      diagnosis: form.diagnosis.trim() || undefined,
      treatmentPlan: form.treatmentPlan.trim() || undefined,
      prescriptions: form.prescriptions.trim() || undefined,
      internalNotes: form.internalNotes.trim() || undefined,
    };
    try {
      const created = await createMutation.mutateAsync(payload);
      router.push(`/dashboard/professional/medical-records/${created.id}`);
    } catch {
      // erro tratado via toast
    }
  };

  return (
    <PageShell>
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          title="Voltar"
        >
          ← Voltar
        </Button>
      </div>

      <PageHeader
        title="Novo prontuário"
        description={`Paciente: ${patientName}`}
      />

      <Card className="border border-gray-200 rounded-xl bg-white">
        <CardContent className="p-5 sm:p-6 flex flex-col gap-5">
          {FIELDS.map((field) => (
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
                value={form[field.key]}
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
          ))}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasAnyField || isSaving}
              title={
                hasAnyField
                  ? "Criar prontuário"
                  : "Preencha ao menos um campo para salvar"
              }
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" /> Salvando…
                </span>
              ) : (
                "Criar prontuário"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
};

export default NewMedicalRecordPage;
