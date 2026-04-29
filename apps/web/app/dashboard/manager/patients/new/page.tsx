'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePatientMutation } from '@/queries/useCreatePatientMutation';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useSearchCepQuery } from '@/queries/useAddressQueries';
import { useEffect } from 'react';
import { newPatientSchema, type NewPatientSchema } from './new-patient.validation';

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
  });

  const zipCodeValue = useWatch({ control, name: 'address.zipCode' });

  const validZipCodeToSearch = zipCodeValue?.length === 8 ? zipCodeValue : '';

  const {
    data: zipCodeData,
    isFetching: isFetchingZipCode,
    error: zipCodeError,
  } = useSearchCepQuery(validZipCodeToSearch);

  useEffect(() => {

    if (zipCodeValue?.length !== 8 || isFetchingZipCode) {
      clearErrors('address.zipCode');
      return;
    }

    if (zipCodeError) {
      setError('address.zipCode', { type: 'manual', message: 'CEP não encontrado' });
      setValue('address.street', '');
      setValue('address.district', '');
      setValue('address.city', '');
      setValue('address.state', '');
      return;
    }

    if (zipCodeData && zipCodeData.zipCode.replace(/\D/g, '') === zipCodeValue) {
      clearErrors('address.zipCode');
      setValue('address.street', zipCodeData.street);
      setValue('address.district', zipCodeData.district);
      setValue('address.city', zipCodeData.city);
      setValue('address.state', zipCodeData.state);
    }
  }, [zipCodeData, zipCodeError, zipCodeValue, isFetchingZipCode, clearErrors, setError, setValue]);

  const onSubmit = (data: NewPatientSchema) => {
    const formattedData = {
      ...data,
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
        toast.error(error.message || 'Erro ao cadastrar paciente');
      },
    });
  };

  return (
    <div className="py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
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
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+5571999999999"
                {...register('phone')}
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
            
            <div className="space-y-5">
              <div className="flex flex-col gap-[0.35rem]">
                <Label htmlFor="address.zipCode" className="text-[0.85rem] font-semibold text-gray-700">
                  CEP *
                </Label>
                <div className="relative">
                  <Input
                    id="address.zipCode"
                    type="text"
                    placeholder="00000000"
                    maxLength={8}
                    inputMode="numeric"
                    {...register('address.zipCode')}
                  />
                  {isFetchingZipCode && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Spinner size="sm" />
                    </div>
                  )}
                </div>
                {errors.address?.zipCode && (
                  <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">
                    {errors.address.zipCode.message}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-[0.35rem]">
                  <Label htmlFor="address.street" className="text-[0.85rem] font-semibold text-gray-700">
                    Rua *
                  </Label>
                  <Input
                    id="address.street"
                    type="text"
                    placeholder="Rua, Avenida, etc"
                    readOnly={isFetchingZipCode}
                    {...register('address.street')}
                  />
                  {errors.address?.street && (
                    <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">
                      {errors.address.street.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-[0.35rem]">
                  <Label htmlFor="address.district" className="text-[0.85rem] font-semibold text-gray-700">
                    Bairro *
                  </Label>
                  <Input
                    id="address.district"
                    type="text"
                    placeholder="Nome do bairro"
                    readOnly={isFetchingZipCode}
                    {...register('address.district')}
                  />
                  {errors.address?.district && (
                    <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">
                      {errors.address.district.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-[0.35rem]">
                  <Label htmlFor="address.number" className="text-[0.85rem] font-semibold text-gray-700">
                    Número *
                  </Label>
                  <Input
                    id="address.number"
                    type="text"
                    placeholder="Ex: 123"
                    {...register('address.number')}
                  />
                  {errors.address?.number && (
                    <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">
                      {errors.address.number.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-[0.35rem]">
                  <Label htmlFor="address.complement" className="text-[0.85rem] font-semibold text-gray-700">
                    Complemento
                  </Label>
                  <Input
                    id="address.complement"
                    type="text"
                    placeholder="Ex: Apto 42, Sala 101"
                    {...register('address.complement')}
                  />
                  {errors.address?.complement && (
                    <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">
                      {errors.address.complement.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-[0.35rem]">
                  <Label htmlFor="address.city" className="text-[0.85rem] font-semibold text-gray-700">
                    Cidade *
                  </Label>
                  <Input
                    id="address.city"
                    type="text"
                    placeholder="Nome da cidade"
                    readOnly={isFetchingZipCode}
                    {...register('address.city')}
                  />
                  {errors.address?.city && (
                    <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">
                      {errors.address.city.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-[0.35rem]">
                  <Label htmlFor="address.state" className="text-[0.85rem] font-semibold text-gray-700">
                    Estado *
                  </Label>
                  <Input
                    id="address.state"
                    type="text"
                    placeholder="BA"
                    maxLength={2}
                    readOnly={isFetchingZipCode}
                    className="uppercase"
                    {...register('address.state')}
                  />
                  {errors.address?.state && (
                    <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">
                      {errors.address.state.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isPending ? 'Cadastrando...' : 'Cadastrar Paciente'}
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
