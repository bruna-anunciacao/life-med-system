import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useMedicalRecordByAppointmentQuery } from "@/queries/useMedicalRecords";
import { medicalRecordsService } from "@/services/medical-records-service";

type VisibleField = {
  key: "chiefComplaint" | "diagnosis" | "treatmentPlan" | "prescriptions";
  label: string;
};

const FIELDS: VisibleField[] = [
  { key: "chiefComplaint", label: "Queixa principal" },
  { key: "diagnosis", label: "Diagnóstico" },
  { key: "treatmentPlan", label: "Plano terapêutico" },
  { key: "prescriptions", label: "Prescrições" },
];

type MedicalRecordViewModalProps = {
  appointmentId: string | null;
  doctorName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MedicalRecordViewModal({
  appointmentId,
  doctorName,
  open,
  onOpenChange,
}: MedicalRecordViewModalProps) {
  const { data: record, isLoading } = useMedicalRecordByAppointmentQuery(
    open ? appointmentId : null,
  );
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!appointmentId) return;
    try {
      setIsDownloading(true);
      await medicalRecordsService.downloadPdf(appointmentId);
      toast.success("PDF do prontuário baixado com sucesso.");
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Erro ao baixar PDF.";
      toast.error(msg);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl bg-white p-0 overflow-hidden border-0 shadow-2xl rounded-2xl max-h-[90vh] flex flex-col"
        aria-label="Visualização do prontuário médico"
      >
        <div className="p-6 pb-4 flex-shrink-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900 tracking-tight">
              Prontuário da consulta
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 pt-1">
              Atendido por <span className="font-medium">{doctorName}</span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-4 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="py-10 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : !record ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              Prontuário não disponível.
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {FIELDS.map((field) => {
                const value = record[field.key];
                return (
                  <div key={field.key} className="flex flex-col gap-1">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                      {field.label}
                    </p>
                    <p className="text-[14.5px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {value ?? (
                        <span className="text-slate-300 italic">
                          Não informado
                        </span>
                      )}
                    </p>
                  </div>
                );
              })}
              <p className="text-xs text-slate-400 italic border-t border-slate-100 pt-3 mt-2">
                Notas internas do profissional não são exibidas neste documento
                conforme política de privacidade.
              </p>
            </div>
          )}
        </div>

        <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-end gap-3 flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl h-10 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 px-5 font-medium"
          >
            Fechar
          </Button>
          <Button
            onClick={handleDownloadPdf}
            disabled={!record || isDownloading || isLoading}
            title="Baixar prontuário em PDF (sem notas internas)"
            className="rounded-xl h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-6 font-medium"
          >
            {isDownloading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" /> Gerando PDF...
              </span>
            ) : (
              "Exportar PDF"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
