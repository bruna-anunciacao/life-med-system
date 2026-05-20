import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  medicalRecordsService,
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
} from "@/services/medical-records-service";

const KEYS = {
  byAppointment: (appointmentId: string) =>
    ["medical-records", "appointment", appointmentId] as const,
  byPatient: (patientId: string) =>
    ["medical-records", "patient", patientId] as const,
};

export function useMedicalRecordByAppointmentQuery(
  appointmentId: string | null,
) {
  return useQuery({
    queryKey: KEYS.byAppointment(appointmentId ?? ""),
    queryFn: () => medicalRecordsService.findByAppointment(appointmentId!),
    enabled: Boolean(appointmentId),
  });
}

export function useMedicalRecordsByPatientQuery(patientId: string | null) {
  return useQuery({
    queryKey: KEYS.byPatient(patientId ?? ""),
    queryFn: () => medicalRecordsService.findByPatient(patientId!),
    enabled: Boolean(patientId),
  });
}

export function useCreateMedicalRecordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMedicalRecordDto) =>
      medicalRecordsService.create(data),
    onSuccess: (record) => {
      queryClient.invalidateQueries({
        queryKey: KEYS.byAppointment(record.appointmentId),
      });
      queryClient.invalidateQueries({
        queryKey: KEYS.byPatient(record.patientId),
      });
      toast.success("Prontuário criado com sucesso.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao criar prontuário.");
    },
  });
}

export function useUpdateMedicalRecordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMedicalRecordDto }) =>
      medicalRecordsService.update(id, data),
    onSuccess: (record) => {
      queryClient.invalidateQueries({
        queryKey: KEYS.byAppointment(record.appointmentId),
      });
      queryClient.invalidateQueries({
        queryKey: KEYS.byPatient(record.patientId),
      });
      toast.success("Prontuário atualizado com sucesso.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar prontuário.");
    },
  });
}
