import { api } from "../lib/api";
import { API_ROUTES } from "../constants/api-routes";

export interface AppointmentItem {
  id: string;
  professionalId: string;
  doctorName: string;
  specialty: string;
  dateTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  modality: "VIRTUAL" | "CLINIC" | "HOME_VISIT";
  notes?: string;
}

export interface CreateAppointmentPayload {
  professionalId: string;
  dateTime: string;
  modality: "VIRTUAL" | "CLINIC" | "HOME_VISIT";
  notes?: string;
}

export const appointmentsService = {
  async listMyAppointments(status?: string): Promise<AppointmentItem[]> {
    const response = await api.get(API_ROUTES.APPOINTMENTS.MY, {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  async createAppointment(payload: CreateAppointmentPayload): Promise<AppointmentItem> {
    const response = await api.post(API_ROUTES.APPOINTMENTS.CREATE, payload);
    return response.data;
  },

  async cancelAppointment(id: string): Promise<void> {
    await api.delete(API_ROUTES.APPOINTMENTS.CANCEL(id));
  },

  async getAvailableSlots(professionalId: string, date: string): Promise<string[]> {
    const response = await api.get(API_ROUTES.APPOINTMENTS.SLOTS, {
      params: { professionalId, date },
    });
    return response.data;
  },
};
