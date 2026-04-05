'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegisterManagerMutation } from '@/queries/useRegisterManagerMutation';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { registerManagerSchema, type RegisterManagerSchema } from './register-manager.validation';

export default function RegisterManagerPage() {
  const router = useRouter();
  const { mutate: register, isPending } = useRegisterManagerMutation();

  const {
    register: field,
    handleSubmit,
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
            <input
              type="tel"
              placeholder="+5571999999999"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...field('phone')}
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
