'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GestorDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para a página principal do gestor
    router.replace('/dashboard/gestor');
  }, [router]);

  return null;
}
