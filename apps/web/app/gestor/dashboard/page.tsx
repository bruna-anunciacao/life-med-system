'use client';

import Link from 'next/link';

export default function GestorDashboard() {
  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Bem-vindo ao Dashboard GESTOR
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link
            href="/gestor/patients/new"
            className="bg-green-500 text-white p-6 rounded-lg shadow-md hover:shadow-lg hover:bg-green-600 transition"
          >
            <div className="text-3xl mb-2">➕</div>
            <h2 className="text-xl font-bold">Cadastrar Paciente</h2>
            <p className="text-sm mt-2">Adicione um novo paciente ao sistema</p>
          </Link>

          <Link
            href="/gestor/appointments/new"
            className="bg-blue-500 text-white p-6 rounded-lg shadow-md hover:shadow-lg hover:bg-blue-600 transition"
          >
            <div className="text-3xl mb-2">📅</div>
            <h2 className="text-xl font-bold">Agendar Consulta</h2>
            <p className="text-sm mt-2">Marque uma consulta com um profissional</p>
          </Link>

          <Link
            href="/gestor/patients"
            className="bg-purple-500 text-white p-6 rounded-lg shadow-md hover:shadow-lg hover:bg-purple-600 transition"
          >
            <div className="text-3xl mb-2">👥</div>
            <h2 className="text-xl font-bold">Ver Pacientes</h2>
            <p className="text-sm mt-2">Gerencie seus pacientes cadastrados</p>
          </Link>

          <Link
            href="/gestor/appointments"
            className="bg-orange-500 text-white p-6 rounded-lg shadow-md hover:shadow-lg hover:bg-orange-600 transition"
          >
            <div className="text-3xl mb-2">📋</div>
            <h2 className="text-xl font-bold">Ver Consultas</h2>
            <p className="text-sm mt-2">Acompanhe todas as consultas agendadas</p>
          </Link>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">
            Recursos Disponíveis
          </h2>
          <ul className="space-y-2 text-blue-800">
            <li>✓ Cadastre novos pacientes sem aprovação prévia do admin</li>
            <li>✓ Edite dados de pacientes a qualquer momento</li>
            <li>✓ Agende consultas com qualquer profissional</li>
            <li>✓ Acompanhe o histórico de consultas</li>
            <li>✓ Acesso instantâneo sem verificação de email</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
