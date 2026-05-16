'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePatientMutation } from '@/queries/useCreatePatientMutation';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAddressCep } from '@/hooks/useAddressCep';
import { AddressFields } from '@/components/address';
import { newPatientSchema, type NewPatientSchema } from './new-patient.validation';
import { PhoneInputBR } from '@/components/ui/phone-input-br';

export default function NewPatientPage() {
  const router = useRouter();
  const { mutate: createPatient, isPending } = useCreatePatientMutation();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<NewPatientSchema>({
    resolver: zodResolver(newPatientSchema),
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  });

  const { isFetchingZipCode } = useAddressCep({
    control,
    setValue,
    setError,
    clearErrors,
    fieldPrefix: 'address',
  });

  const onSubmit = (data: NewPatientSchema) => {
    const formattedData = {
      ...data,
      dateOfBirth: data.dateOfBirth || undefined,
      gender: data.gender || undefined,
      cpf: data.cpf || undefined,
      address: {
        zipCode: data.address.zipCode,
        street: data.address.street,
        number: data.address.number,
        complement: data.address.complement || undefined,
        district: data.address.district,
        city: data.address.city,
        state: data.address.state,
      },
    };

    createPatient(formattedData, {
      onSuccess: (patient) => {
        toast.success('Paciente cadastrado com sucesso!');
        router.push(`/dashboard/manager/patients/${patient.id}/questionnaire`);
      },
      onError: (error: Error) => {
        toast.error(error?.message || 'Erro ao cadastrar paciente');
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Cadastrar Novo Paciente
          </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                type="text"
                placeholder="João Silva"
                title="Insira o nome completo do paciente"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="paciente@email.com"
                title="Insira o endereço de e-mail para contato e acesso"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Telefone *</Label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <PhoneInputBR
                    id="phone"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
              />
              {errors.phone && (
                <p className="text-xs text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="cpf">CPF (opcional)</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                title="Insira o CPF do paciente (apenas números ou formatado)"
                {...register('cpf')}
              />
              {errors.cpf && (
                <p className="text-xs text-red-600">{errors.cpf.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="dateOfBirth">Data de Nascimento (opcional)</Label>
              <Input
                id="dateOfBirth"
                type="date"
                title="Selecione a data de nascimento"
                {...register('dateOfBirth')}
              />
              {errors.dateOfBirth && (
                <p className="text-xs text-red-600">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="gender">Gênero (opcional)</Label>
              <select
                id="gender"
                title="Selecione o gênero do paciente"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('gender')}
              >
                <option value="">Selecione...</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="O">Outro</option>
              </select>
              {errors.gender && (
                <p className="text-xs text-red-600">{errors.gender.message}</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-gray-700">Endereço</h2>
              <p className="text-sm text-gray-500">Cadastre o endereço de localização do paciente.</p>
            </div>
            
            <AddressFields
              register={register}
              errors={errors}
              isFetchingZipCode={isFetchingZipCode}
              fieldPrefix="address"
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isPending}
              title="Clique para realizar o cadastro do paciente"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isPending ? 'Cadastrando...' : 'Cadastrar Paciente'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              title="Cancelar e voltar para a tela anterior"
              onClick={() => router.push("/dashboard/manager/patients")}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}