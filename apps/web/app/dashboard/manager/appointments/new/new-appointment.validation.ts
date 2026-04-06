import * as z from 'zod';

export const newAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Paciente é obrigatório'),
  professionalId: z.string().min(1, 'Profissional é obrigatório'),
  dateTime: z.string().min(1, 'Data e hora são obrigatórias'),
  notes: z.string().max(500, 'Notas devem ter no máximo 500 caracteres').optional().or(z.literal('')),
  modality: z.enum(['VIRTUAL', 'CLINIC', 'HOME_VISIT'])
});

export type NewAppointmentSchema = z.infer<typeof newAppointmentSchema>;
