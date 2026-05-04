'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegisterManagerMutation } from '@/queries/useRegisterManagerMutation';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { registerManagerSchema, type RegisterManagerSchema } from './register-manager.validation';
import ptBr from "react-phone-number-input/locale/pt-BR";
import PhoneInput from "react-phone-number-input";

export default function RegisterManagerPage() {
  const router = useRouter();
  const { mutate: register, isPending } = useRegisterManagerMutation();

  const {
    register: field,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterManagerSchema>({
    resolver: zodResolver(registerManagerSchema),
  });

  const onSubmit = (data: RegisterManagerSchema) => {
    register(data, {
      onSuccess: () => {
        router.push('/dashboard/manager');
      },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
          Registrar como MANAGER
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...field('email')}
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              placeholder="Senha segura"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...field('password')}
            />
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
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
              <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço (opcional)
            </label>
            <input
              type="text"
              placeholder="Rua..., Número..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...field('address')}
            />
            {errors.address && (
              <p className="text-xs text-red-600 mt-1">{errors.address.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio (opcional)
            </label>
            <textarea
              placeholder="Descreva-se brevemente"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...field('bio')}
            />
            {errors.bio && (
              <p className="text-xs text-red-600 mt-1">{errors.bio.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Registrando...' : 'Registrar como MANAGER'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Faça login
          </a>
        </div>
      </div>
    </div>
  );
}
