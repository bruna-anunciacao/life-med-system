'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateAppointmentMutation } from '@/queries/useCreateAppointmentMutation';
import { useListPatientsQuery } from '@/queries/useListPatientsQuery';
import { useProfessionalsQuery } from '@/queries/useProfessionalsQuery';
import { useProfessionalAvailabilityQuery } from '@/queries/useProfessionalAvailabilityQuery';
import { Autocomplete } from '@/components/ui/autocomplete';
import { ProfessionalAvailabilityDisplay } from '@/components/ui/professional-availability-display';
import { useRouter } from 'next/navigation';
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
        router.push('/dashboard/manager/appointments');
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paciente *
              </label>
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
                <p className="text-xs text-red-500 mt-1">{errors.patientId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profissional *
              </label>
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
                <p className="text-xs text-red-500 mt-1">{errors.professionalId.message}</p>
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data e Hora *
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('dateTime')}
              />
              {errors.dateTime && (
                <p className="text-xs text-red-500 mt-1">{errors.dateTime.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              placeholder="Informações relevantes sobre a consulta..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('notes')}
            />
            {errors.notes && (
              <p className="text-xs text-red-500 mt-1">{errors.notes.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Agendando...' : 'Agendar Consulta'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-md font-medium hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
