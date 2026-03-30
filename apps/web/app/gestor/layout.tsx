'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function GestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-role');
    localStorage.removeItem('user-status');
    router.push('/auth/login');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/gestor/dashboard" className="text-2xl font-bold">
            Life Med - GESTOR
          </Link>

          <div className="hidden md:flex space-x-6">
            <Link
              href="/gestor/dashboard"
              className="hover:text-blue-200 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/gestor/patients"
              className="hover:text-blue-200 transition"
            >
              Pacientes
            </Link>
            <Link
              href="/gestor/appointments"
              className="hover:text-blue-200 transition"
            >
              Consultas
            </Link>
            <button
              onClick={handleLogout}
              className="hover:text-blue-200 transition"
            >
              Sair
            </button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setShowMenu(!showMenu)}
          >
            ☰
          </button>
        </div>

        {showMenu && (
          <div className="md:hidden bg-blue-700 px-4 py-2 space-y-2">
            <Link
              href="/gestor/dashboard"
              className="block hover:text-blue-200 py-2"
            >
              Dashboard
            </Link>
            <Link
              href="/gestor/patients"
              className="block hover:text-blue-200 py-2"
            >
              Pacientes
            </Link>
            <Link
              href="/gestor/appointments"
              className="block hover:text-blue-200 py-2"
            >
              Consultas
            </Link>
            <button
              onClick={handleLogout}
              className="block hover:text-blue-200 py-2 w-full text-left"
            >
              Sair
            </button>
          </div>
        )}
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4">{children}</main>

      <footer className="bg-gray-200 text-gray-600 py-4 text-center">
        <p>&copy; 2026 Life Med System. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
