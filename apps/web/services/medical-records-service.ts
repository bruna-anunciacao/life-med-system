import { api } from "../lib/api";
import { AxiosError } from "axios";

export interface MedicalRecordAuthor {
  id: string;
  name: string;
  email: string;
}

export interface MedicalRecordPatient {
  id: string;
  name: string;
}

export interface MedicalRecordAppointment {
  id: string;
  dateTime: string;
  modality: string;
}

export interface MedicalRecordResponse {
  id: string;
  appointmentId: string;
  patientId: string;
  author: MedicalRecordAuthor;
  patient?: MedicalRecordPatient;
  appointment?: MedicalRecordAppointment;
  chiefComplaint: string | null;
  diagnosis: string | null;
  treatmentPlan: string | null;
  prescriptions: string | null;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecordPatientResponse {
  id: string;
  appointmentId: string;
  patientId: string;
  author: MedicalRecordAuthor;
  appointment?: MedicalRecordAppointment;
  chiefComplaint: string | null;
  diagnosis: string | null;
  treatmentPlan: string | null;
  prescriptions: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedMedicalRecords<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

export interface CreateMedicalRecordDto {
  appointmentId: string;
  chiefComplaint?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  prescriptions?: string;
  internalNotes?: string;
}

export type UpdateMedicalRecordDto = Omit<
  CreateMedicalRecordDto,
  "appointmentId"
>;

export interface ListMedicalRecordsParams {
  patientId?: string;
  authorId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

function downloadBlob(blob: Blob, filename: string): void {
  const blobUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(blobUrl);
}

function extractErrorMessage(error: unknown, fallback: string): never {
  if (error instanceof AxiosError && error.response) {
    const message = error.response.data.message;
    if (Array.isArray(message)) {
      throw new Error(message.join(", "));
    }
    throw new Error(message || fallback);
  }
  throw new Error("Erro de conexão com o servidor.");
}

export const medicalRecordsService = {
  async create(data: CreateMedicalRecordDto): Promise<MedicalRecordResponse> {
    try {
      const response = await api.post("/medical-records", data);
      return response.data as MedicalRecordResponse;
    } catch (error) {
      extractErrorMessage(error, "Erro ao criar prontuário.");
    }
  },

  async list(
    params: ListMedicalRecordsParams = {},
  ): Promise<PaginatedMedicalRecords<MedicalRecordResponse>> {
    try {
      const response = await api.get("/medical-records", { params });
      return response.data as PaginatedMedicalRecords<MedicalRecordResponse>;
    } catch (error) {
      extractErrorMessage(error, "Erro ao listar prontuários.");
    }
  },

  async listForPatient(
    params: ListMedicalRecordsParams = {},
  ): Promise<PaginatedMedicalRecords<MedicalRecordPatientResponse>> {
    try {
      const response = await api.get("/medical-records", { params });
      return response.data as PaginatedMedicalRecords<MedicalRecordPatientResponse>;
    } catch (error) {
      extractErrorMessage(error, "Erro ao listar prontuários.");
    }
  },

  async findById(
    id: string,
  ): Promise<MedicalRecordResponse | MedicalRecordPatientResponse> {
    try {
      const response = await api.get(`/medical-records/${id}`);
      return response.data;
    } catch (error) {
      extractErrorMessage(error, "Erro ao buscar prontuário.");
    }
  },

  async findByAppointment(
    appointmentId: string,
  ): Promise<MedicalRecordResponse | MedicalRecordPatientResponse | null> {
    try {
      const response = await api.get(
        `/medical-records/appointment/${appointmentId}`,
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return null;
      }
      extractErrorMessage(error, "Erro ao buscar prontuário.");
    }
  },

  async findByPatient(patientId: string): Promise<MedicalRecordResponse[]> {
    try {
      const response = await api.get(`/medical-records/patient/${patientId}`);
      return response.data as MedicalRecordResponse[];
    } catch (error) {
      extractErrorMessage(error, "Erro ao buscar prontuários do paciente.");
    }
  },

  async listShared(
    params: ListMedicalRecordsParams = {},
  ): Promise<PaginatedMedicalRecords<MedicalRecordResponse>> {
    try {
      const response = await api.get("/medical-records/shared", { params });
      return response.data as PaginatedMedicalRecords<MedicalRecordResponse>;
    } catch (error) {
      extractErrorMessage(error, "Erro ao buscar prontuários compartilhados.");
    }
  },

  async update(
    id: string,
    data: UpdateMedicalRecordDto,
  ): Promise<MedicalRecordResponse> {
    try {
      const response = await api.patch(`/medical-records/${id}`, data);
      return response.data as MedicalRecordResponse;
    } catch (error) {
      extractErrorMessage(error, "Erro ao atualizar prontuário.");
    }
  },

  async downloadPdf(appointmentId: string): Promise<void> {
    try {
      const response = await api.get(
        `/medical-records/appointment/${appointmentId}/pdf`,
        { responseType: "blob" },
      );
      downloadBlob(response.data, `prontuario-${appointmentId}.pdf`);
    } catch (error) {
      extractErrorMessage(error, "Erro ao baixar prontuário em PDF.");
    }
  },
};
