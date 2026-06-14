'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePatientMutation } from '@/queries/useCreatePatientMutation';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAddressCep } from '@/hooks/useAddressCep';
import { AddressFields } from '@/components/address';
import { newPatientSchema, type NewPatientSchema } from './new-patient.validation';
import { PhoneInputBR } from '@/components/ui/phone-input-br';
import { PageShell, PageHeader } from '../../../../ui/dashboard/page-shell';

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
    <PageShell>
      <Button
        onClick={() => router.push("/dashboard/manager/patients")}
        variant="ghost"
        size="sm"
        className="mb-4"
        title="Voltar para a lista de pacientes"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <PageHeader
        title="Cadastrar Novo Paciente"
        description="Preencha os dados do paciente."
      />

      <Card>
        <CardContent className="p-6">
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
                <p className="text-xs text-destructive">{errors.name.message}</p>
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
                <p className="text-xs text-destructive">{errors.email.message}</p>
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
                <p className="text-xs text-destructive">{errors.phone.message}</p>
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
                <p className="text-xs text-destructive">{errors.cpf.message}</p>
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
                <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="gender">Gênero (opcional)</Label>
              <select
                id="gender"
                title="Selecione o gênero do paciente"
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
                {...register('gender')}
              >
                <option value="">Selecione...</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="O">Outro</option>
              </select>
              {errors.gender && (
                <p className="text-xs text-destructive">{errors.gender.message}</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-foreground">Endereço</h2>
              <p className="text-sm text-muted-foreground">Cadastre o endereço de localização do paciente.</p>
            </div>

            <AddressFields
              register={register}
              errors={errors}
              isFetchingZipCode={isFetchingZipCode}
              fieldPrefix="address"
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row-reverse sm:justify-start">
            <Button
              type="submit"
              disabled={isPending}
              title="Clique para realizar o cadastro do paciente"
              className="sm:w-auto sm:px-8"
            >
              {isPending ? 'Cadastrando...' : 'Cadastrar Paciente'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              title="Cancelar e voltar para a tela anterior"
              onClick={() => router.push("/dashboard/manager/patients")}
              className="sm:w-auto sm:px-8"
            >
              Cancelar
            </Button>
          </div>
          </form>
        </CardContent>
      </Card>
    </PageShell>
  );
}