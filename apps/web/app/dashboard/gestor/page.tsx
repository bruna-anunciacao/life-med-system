"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { usersService } from "../../../services/users-service";
import { Users, Calendar, FileText, Plus } from "lucide-react";
import Link from "next/link";

const GestorDashboard = () => {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersService
      .getUser()
      .then((data) => setUserName(data.name?.split(" ")[0] || ""))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      title: "Pacientes",
      value: "0",
      icon: <Users size={24} />,
      colorClass: "bg-blue-50 text-blue-500",
    },
    {
      title: "Consultas",
      value: "0",
      icon: <Calendar size={24} />,
      colorClass: "bg-green-50 text-green-500",
    },
    {
      title: "Relatórios",
      value: "0",
      icon: <FileText size={24} />,
      colorClass: "bg-purple-50 text-purple-500",
    },
  ];

  const quickActions = [
    {
      label: "Cadastrar Paciente",
      href: "/dashboard/gestor/patients/new",
      icon: <Plus size={20} />,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      label: "Agendar Consulta",
      href: "/dashboard/gestor/appointments/new",
      icon: <Calendar size={20} />,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      label: "Ver Pacientes",
      href: "/dashboard/gestor/patients",
      icon: <Users size={20} />,
      color: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  if (loading) {
    return (
      <section className="min-h-screen w-full bg-slate-50 p-8">
        <div className="flex items-center justify-center">
          <p className="text-slate-600">Carregando...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen w-full bg-slate-50 p-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Bem-vindo, {userName}!
        </h1>
        <p className="mt-2 text-slate-600">
          Você está no painel de gestor. Gerencie pacientes e consultas.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-white">
            <CardContent className="p-6">
              <div className={`mb-4 inline-flex rounded-lg p-3 ${stat.colorClass}`}>
                {stat.icon}
              </div>
              <p className="text-sm font-medium text-slate-600">{stat.title}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Button className={`w-full h-24 text-lg font-semibold text-white ${action.color}`}>
                <div className="flex flex-col items-center gap-2">
                  {action.icon}
                  {action.label}
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <Card className="bg-white">
        <CardContent className="p-6 md:p-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Recursos Disponíveis
          </h2>
          <ul className="grid grid-cols-1 gap-3 text-slate-600 md:grid-cols-2">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Cadastre novos pacientes sem aprovação prévia</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Edite dados de pacientes a qualquer momento</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Agende consultas com qualquer profissional</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Acompanhe o histórico de consultas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Acesso instantâneo sem verificação de email</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Gere relatórios de atividades</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </section>
  );
};

export default GestorDashboard;
