import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  medicalRecordsService,
  CreateMedicalRecordDto,
  ListMedicalRecordsParams,
  UpdateMedicalRecordDto,
} from "@/services/medical-records-service";

export function useSharedMedicalRecordsQuery(params: ListMedicalRecordsParams) {
  return useQuery({
    queryKey: KEYS.shared(params),
    queryFn: () => medicalRecordsService.listShared(params),
  });
}

const KEYS = {
  list: (params: ListMedicalRecordsParams) =>
    ["medical-records", "list", params] as const,
  listForPatient: (params: ListMedicalRecordsParams) =>
    ["medical-records", "list-patient", params] as const,
  shared: (params: ListMedicalRecordsParams) =>
    ["medical-records", "shared", params] as const,
  byId: (id: string) => ["medical-records", "id", id] as const,
  byAppointment: (appointmentId: string) =>
    ["medical-records", "appointment", appointmentId] as const,
  byPatient: (patientId: string) =>
    ["medical-records", "patient", patientId] as const,
};

export function useMedicalRecordsListQuery(params: ListMedicalRecordsParams) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => medicalRecordsService.list(params),
  });
}

export function useMedicalRecordsListForPatientQuery(
  params: ListMedicalRecordsParams,
) {
  return useQuery({
    queryKey: KEYS.listForPatient(params),
    queryFn: () => medicalRecordsService.listForPatient(params),
  });
}

export function useMedicalRecordByIdQuery(id: string | null) {
  return useQuery({
    queryKey: KEYS.byId(id ?? ""),
    queryFn: () => medicalRecordsService.findById(id!),
    enabled: Boolean(id),
  });
}

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

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["medical-records"] });
}

export function useCreateMedicalRecordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMedicalRecordDto) =>
      medicalRecordsService.create(data),
    onSuccess: () => {
      invalidateAll(queryClient);
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
    onSuccess: () => {
      invalidateAll(queryClient);
      toast.success("Prontuário atualizado com sucesso.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar prontuário.");
    },
  });
}
