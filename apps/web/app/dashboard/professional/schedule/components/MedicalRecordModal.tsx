import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  useCreateMedicalRecordMutation,
  useMedicalRecordByAppointmentQuery,
  useUpdateMedicalRecordMutation,
} from "@/queries/useMedicalRecords";
import { useUserQuery } from "@/queries/useUserQuery";
import { MedicalRecordResponse } from "@/services/medical-records-service";

type ClinicalField = {
  key:
    | "chiefComplaint"
    | "diagnosis"
    | "treatmentPlan"
    | "prescriptions"
    | "internalNotes";
  label: string;
  placeholder: string;
  patientHidden?: boolean;
};

const FIELDS: ClinicalField[] = [
  {
    key: "chiefComplaint",
    label: "Queixa principal",
    placeholder: "Motivo principal relatado pelo paciente...",
  },
  {
    key: "diagnosis",
    label: "Diagnóstico",
    placeholder: "Hipóteses ou diagnóstico confirmado...",
  },
  {
    key: "treatmentPlan",
    label: "Plano terapêutico",
    placeholder: "Plano de tratamento, condutas, orientações...",
  },
  {
    key: "prescriptions",
    label: "Prescrições",
    placeholder: "Medicações, dosagens, exames solicitados...",
  },
  {
    key: "internalNotes",
    label: "Notas internas",
    placeholder: "Observações privadas (não visíveis ao paciente)...",
    patientHidden: true,
  },
];

const EMPTY_FORM: Record<ClinicalField["key"], string> = {
  chiefComplaint: "",
  diagnosis: "",
  treatmentPlan: "",
  prescriptions: "",
  internalNotes: "",
};

type MedicalRecordModalProps = {
  appointmentId: string | null;
  patientName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function isFullRecord(
  record: unknown,
): record is MedicalRecordResponse {
  return (
    record !== null &&
    typeof record === "object" &&
    "internalNotes" in (record as Record<string, unknown>)
  );
}

export function MedicalRecordModal({
  appointmentId,
  patientName,
  open,
  onOpenChange,
}: MedicalRecordModalProps) {
  const { data: currentUser } = useUserQuery();
  const { data: existingRecord, isLoading } =
    useMedicalRecordByAppointmentQuery(open ? appointmentId : null);
  const createMutation = useCreateMedicalRecordMutation();
  const updateMutation = useUpdateMedicalRecordMutation();

  const [form, setForm] = useState(EMPTY_FORM);

  const fullRecord = isFullRecord(existingRecord) ? existingRecord : null;

  const isAuthor = useMemo(() => {
    if (!fullRecord || !currentUser) return false;
    return fullRecord.author.id === currentUser.id;
  }, [fullRecord, currentUser]);

  const isReadOnly = Boolean(fullRecord) && !isAuthor;

  useEffect(() => {
    if (!open) return;
    if (fullRecord) {
      setForm({
        chiefComplaint: fullRecord.chiefComplaint ?? "",
        diagnosis: fullRecord.diagnosis ?? "",
        treatmentPlan: fullRecord.treatmentPlan ?? "",
        prescriptions: fullRecord.prescriptions ?? "",
        internalNotes: fullRecord.internalNotes ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, fullRecord]);

  const hasAnyField = Object.values(form).some((v) => v.trim().length > 0);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = async () => {
    if (!appointmentId || !hasAnyField) return;

    const payload = {
      chiefComplaint: form.chiefComplaint.trim() || undefined,
      diagnosis: form.diagnosis.trim() || undefined,
      treatmentPlan: form.treatmentPlan.trim() || undefined,
      prescriptions: form.prescriptions.trim() || undefined,
      internalNotes: form.internalNotes.trim() || undefined,
    };

    try {
      if (fullRecord) {
        await updateMutation.mutateAsync({ id: fullRecord.id, data: payload });
      } else {
        await createMutation.mutateAsync({ appointmentId, ...payload });
      }
      onOpenChange(false);
    } catch {
      // erros já tratados via toast nas mutations
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl bg-white p-0 overflow-hidden border-0 shadow-2xl rounded-2xl max-h-[90vh] flex flex-col"
        aria-label="Modal de prontuário médico"
      >
        <div className="p-6 pb-4 flex-shrink-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900 tracking-tight">
              Prontuário médico
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 pt-1">
              Paciente: <span className="font-medium">{patientName}</span>
              {isReadOnly && fullRecord && (
                <span className="block mt-1">
                  Apenas leitura — autor: {fullRecord.author.name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-4 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="py-10 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
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
                    readOnly={isReadOnly}
                    disabled={isSaving}
                    className="w-full min-h-24 p-3 resize-y rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[14.5px] leading-relaxed placeholder:text-slate-400 shadow-sm transition-all duration-200 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/20 read-only:bg-slate-100 read-only:cursor-default"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-end gap-3 flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="rounded-xl h-10 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 px-5 font-medium"
          >
            {isReadOnly ? "Fechar" : "Cancelar"}
          </Button>
          {!isReadOnly && (
            <Button
              onClick={handleSave}
              disabled={!hasAnyField || isSaving || isLoading}
              title={
                hasAnyField
                  ? "Salvar prontuário"
                  : "Preencha ao menos um campo para salvar"
              }
              className="rounded-xl h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-6 font-medium"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" /> Salvando...
                </span>
              ) : fullRecord ? (
                "Atualizar prontuário"
              ) : (
                "Salvar prontuário"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
