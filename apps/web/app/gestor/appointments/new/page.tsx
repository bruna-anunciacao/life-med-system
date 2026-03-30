'use client';

import { useState } from 'react';
import { useCreateAppointmentMutation } from '@/queries/useCreateAppointmentMutation';
import { useListPatientsQuery } from '@/queries/useListPatientsQuery';
import { useProfessionalsQuery } from '@/queries/useProfessionalsQuery';
import { useRouter } from 'next/navigation';

export default function NewAppointmentPage() {
  const router = useRouter();
  const { data: patients = [] } = useListPatientsQuery();
  const { data: professionals = [] } = useProfessionalsQuery();

  const [formData, setFormData] = useState({
    patientId: '',
    professionalId: '',
    dateTime: '',
    notes: '',
  });

  const [error, setError] = useState<string | null>(null);

  const { mutate: createAppointment, isPending } =
    useCreateAppointmentMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    createAppointment(formData, {
      onSuccess: () => {
        router.push('/gestor/appointments');
      },
      onError: (error: Error) => {
        setError(error.message);
      },
    });
  };

  return (
    <div className="py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Agendar Nova Consulta
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paciente *
              </label>
              <select
                value={formData.patientId}
                onChange={(e) =>
                  setFormData({ ...formData, patientId: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um paciente</option>
                {patients.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profissional *
              </label>
              <select
                value={formData.professionalId}
                onChange={(e) =>
                  setFormData({ ...formData, professionalId: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um profissional</option>
                {professionals.map((prof: any) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data e Hora *
              </label>
              <input
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) =>
                  setFormData({ ...formData, dateTime: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              placeholder="Informações relevantes sobre a consulta..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
