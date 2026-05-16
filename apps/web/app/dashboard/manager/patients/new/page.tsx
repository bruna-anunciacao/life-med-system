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
import ptBr from "react-phone-number-input/locale/pt-BR";
import PhoneInput from "react-phone-number-input";

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
                render={({ field }) => {
                  let safeValue = field.value
                    ? field.value.replace(/[^\d+]/g, "")
                    : "";

                  if (safeValue && !safeValue.startsWith("+")) {
                    safeValue = `+55${safeValue}`;
                  }

                  return (
                    <PhoneInput
                      id="phone"
                      placeholder="(71) 99999-9999"
                      international
                      countryCallingCodeEditable={false}
                      labels={ptBr}
                      defaultCountry="BR"
                      value={safeValue || undefined}
                      onChange={(val) => field.onChange(val || "")}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      className="w-full flex items-center border border-gray-300 rounded-md overflow-hidden transition-colors duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white [&_.PhoneInputCountry]:max-w-[40%] [&_.PhoneInputCountry]:px-3 [&_.PhoneInputCountry]:flex [&_.PhoneInputCountry]:flex-row-reverse [&_.PhoneInputCountry]:items-center [&_.PhoneInputCountry]:justify-start [&_.PhoneInputCountry]:gap-1 [&_.PhoneInputCountry]:border-r [&_.PhoneInputCountry]:border-gray-300 [&_.PhoneInputCountrySelect]:max-w-[80%] [&_.PhoneInputCountryIcon]:w-5 [&_.PhoneInputCountryIcon]:h-[14px] [&_.PhoneInputCountryIcon]:flex [&_.PhoneInputCountryIcon]:justify-center [&_.PhoneInputCountryIcon]:items-center [&_.PhoneInputCountryIcon]:overflow-hidden [&_.PhoneInputCountryIcon_img]:w-full [&_.PhoneInputCountryIcon_img]:h-full [&_.PhoneInputCountryIcon_img]:object-cover [&_.PhoneInputInput]:h-full [&_.PhoneInputInput]:py-2 [&_.PhoneInputInput]:px-3 [&_.PhoneInputInput]:flex-1 [&_.PhoneInputInput]:border-none [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:text-gray-900 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:outline-none"
                    />
                  );
                }}
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