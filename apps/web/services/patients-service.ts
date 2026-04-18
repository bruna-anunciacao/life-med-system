import { api } from "../lib/api";
import { API_ROUTES } from "../constants/api-routes";

export interface ExportAppointmentsReportQuery {
  professionalId?: string;
  startDate?: string;
  endDate?: string;
}

interface DefaultErrorPayload { 
    message: string;
    statusCode: number;
}

const getTimestampedFilename = (base: string): string => {
  const now = new Date();
  const date = now.toLocaleDateString("pt-BR").replace(/\//g, "-");
  const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }).replace(":", "-");
  return `${base}_${date}_${time}.pdf`;
};

const downloadBlob = (blob: Blob, filename: string) => {
  const blobUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(blobUrl);
};

export const patientsService = {
  async downloadDoneAppointmentsReport(query?: ExportAppointmentsReportQuery) {
    try {
      const response = await api.get(
        API_ROUTES.PATIENTS.EXPORT_DONE_APPOINTMENTS,
        {
          params: query,
          responseType: "blob",
        },
      );

      downloadBlob(response.data, getTimestampedFilename("relatorio-consultas-concluidas"));
    } catch (error) {
      throw new Error(
        (error as DefaultErrorPayload).message || "Erro ao baixar relatório de consultas realizadas.",
      );
    }
  },

  async downloadPendingAppointmentsReport(
    query?: ExportAppointmentsReportQuery,
  ) {
    try {
      const response = await api.get(
        API_ROUTES.PATIENTS.EXPORT_PENDING_APPOINTMENTS,
        {
          params: query,
          responseType: "blob",
        },
      );

      downloadBlob(response.data, getTimestampedFilename("relatorio-consultas-pendentes"));
    } catch (error) {
      throw new Error(
        (error as DefaultErrorPayload).message || "Erro ao baixar relatório de consultas pendentes.",
      );
    }
  },

  async downloadCancelledAppointmentsReport(
    query?: ExportAppointmentsReportQuery,
  ) {
    try {
      const response = await api.get(
        API_ROUTES.PATIENTS.EXPORT_CANCELLED_APPOINTMENTS,
        {
          params: query,
          responseType: "blob",
        },
      );

      downloadBlob(response.data, getTimestampedFilename("relatorio-consultas-canceladas"));
    } catch (error) {
      throw new Error(
        (error as DefaultErrorPayload).message || "Erro ao baixar relatório de consultas canceladas.",
      );
    }
  },
};
