'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateAppointmentMutation } from '@/queries/useCreateAppointmentMutation';
import { useListPatientsQuery } from '@/queries/useListPatientsQuery';
import { useProfessionalsQuery } from '@/queries/useProfessionalsQuery';
import { useProfessionalAvailabilityQuery } from '@/queries/useProfessionalAvailabilityQuery';
import { Autocomplete } from '@/components/ui/autocomplete';
import { ProfessionalAvailabilityDisplay } from '@/components/ui/professional-availability-display';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { newAppointmentSchema, type NewAppointmentSchema } from './new-appointment.validation';

export default function NewAppointmentPage() {
  const router = useRouter();
  const { data: patients = [] } = useListPatientsQuery();
  const { data: professionals = [] } = useProfessionalsQuery();

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NewAppointmentSchema>({
    resolver: zodResolver(newAppointmentSchema),
    defaultValues: { patientId: '', professionalId: '', dateTime: '', notes: '' },
  });

  const selectedProfessionalId = watch('professionalId');

  const { data: professionalAvailability, isLoading: availabilityLoading } =
    useProfessionalAvailabilityQuery(selectedProfessionalId || null);

  const { mutate: createAppointment, isPending } = useCreateAppointmentMutation();

  const onSubmit = (data: NewAppointmentSchema) => {
    createAppointment(data, {
      onSuccess: () => {
        toast.success('Consulta agendada com sucesso!');
        router.push('/dashboard/manager/appointments');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Erro ao agendar consulta');
      },
    });
  };

  return (
    <div className="py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Agendar Nova Consulta
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="patientId">Paciente *</Label>
              <Controller
                name="patientId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    items={patients.map((p: any) => ({
                      id: p.id,
                      email: p.email,
                      label: p.name || p.email,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Buscar paciente..."
                    displayKey="email"
                  />
                )}
              />
              {errors.patientId && (
                <p className="text-xs text-red-500">{errors.patientId.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="professionalId">Profissional *</Label>
              <Controller
                name="professionalId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    items={professionals.map((prof: any) => ({
                      id: prof.id,
                      email: prof.email,
                      name: prof.name || prof.email,
                      specialty: prof.professionalProfile?.specialty || 'Não informado',
                      label: prof.name || prof.email,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Buscar profissional..."
                    displayKey="email"
                    searchKeys={['email', 'name', 'specialty']}
                  />
                )}
              />
              {errors.professionalId && (
                <p className="text-xs text-red-500">{errors.professionalId.message}</p>
              )}
            </div>

            {selectedProfessionalId && (
              <div className="md:col-span-2">
                <ProfessionalAvailabilityDisplay
                  availability={professionalAvailability?.availability || []}
                  isLoading={availabilityLoading}
                  className="mb-0"
                />
              </div>
            )}

            <div className="md:col-span-2 space-y-1">
              <Label htmlFor="dateTime">Data e Hora *</Label>
              <Input
                id="dateTime"
                type="datetime-local"
                {...register('dateTime')}
              />
              {errors.dateTime && (
                <p className="text-xs text-red-500">{errors.dateTime.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <textarea
              id="notes"
              placeholder="Informações relevantes sobre a consulta..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              {...register('notes')}
            />
            {errors.notes && (
              <p className="text-xs text-red-500">{errors.notes.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending ? 'Agendando...' : 'Agendar Consulta'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
