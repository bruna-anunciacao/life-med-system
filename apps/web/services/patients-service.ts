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

      downloadBlob(response.data, "relatorio-consultas-concluidas.pdf");
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

      downloadBlob(response.data, "relatorio-consultas-pendentes.pdf");
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

      downloadBlob(response.data, "relatorio-consultas-canceladas.pdf");
    } catch (error) {
      console.log(error);
      throw new Error(
        (error as DefaultErrorPayload).message || "Erro ao baixar relatório de consultas canceladas.",
      );
    }
  },
};
