"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useMedicalRecordByIdQuery } from "@/queries/useMedicalRecords";
import { medicalRecordsService } from "@/services/medical-records-service";
import { CalendarIcon } from "../../../../utils/icons";
import { PageShell } from "../../../../ui/dashboard/page-shell";

const FIELDS = [
  { key: "chiefComplaint", label: "Queixa principal" },
  { key: "diagnosis", label: "Diagnóstico" },
  { key: "treatmentPlan", label: "Plano terapêutico" },
  { key: "prescriptions", label: "Prescrições" },
] as const;

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PatientMedicalRecordDetailsPage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const isMobile = useIsMobile();
  const { data: record, isLoading } = useMedicalRecordByIdQuery(
    params?.id ?? null,
  );
  const [isDownloading, setIsDownloading] = useState(false);

  if (isLoading) {
    return (
      <PageShell className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
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
          onClick={() => router.push("/dashboard/patient/medical-records")}
        >
          Voltar para a lista
        </Button>
      </PageShell>
    );
  }

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      await medicalRecordsService.downloadPdf(record.appointmentId);
      toast.success("PDF do prontuário baixado com sucesso.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao baixar PDF.";
      toast.error(msg);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <PageShell>
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/patient/medical-records")}
          title="Voltar para a lista"
        >
          ← Voltar
        </Button>
      </div>

      <Card className="border border-gray-200 rounded-xl bg-white mb-5">
        <CardContent className="p-5 sm:p-6 flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1
                className={`font-bold text-slate-900 tracking-tight ${isMobile ? "text-xl" : "text-2xl"}`}
              >
                Prontuário da consulta
              </h1>
              <p className="mt-1 text-sm text-slate-500 flex items-center gap-1.5 flex-wrap">
                <CalendarIcon size={14} />
                {record.appointment
                  ? formatDateTime(record.appointment.dateTime)
                  : formatDateTime(record.createdAt)}
                <span className="text-slate-300">•</span>
                Atendido por{" "}
                <span className="font-medium">{record.author.name}</span>
              </p>
            </div>
            <Button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              title="Baixar prontuário em PDF (sem notas internas)"
            >
              {isDownloading ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" /> Gerando PDF…
                </span>
              ) : (
                "Exportar PDF"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 rounded-xl bg-white">
        <CardContent className="p-5 sm:p-6 flex flex-col gap-5">
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
        </CardContent>
      </Card>
    </PageShell>
  );
};

export default PatientMedicalRecordDetailsPage;
