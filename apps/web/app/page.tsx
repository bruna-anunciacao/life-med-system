import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "./life-med-logo.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col">
      <header className="flex justify-between items-center px-8 py-0 max-w-[1280px] mx-auto w-full md:px-4">
        <div className="flex items-center">
          <Image src={Logo} alt="Life Med Logo" width={200} />
        </div>
        <nav>
          <Link href="/auth/login">
            <Button variant="outline">Entrar</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col px-6 max-w-7xl mx-auto w-full">
        {/* Hero: duas colunas */}
        <section className="flex flex-col lg:flex-row items-center gap-12 py-16">
          {/* Coluna esquerda: texto */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h1 className="text-[3.2rem] font-extrabold mb-6 tracking-tight leading-[1.1] bg-linear-to-br from-[#2563eb] to-[#0ea5e9] bg-clip-text text-transparent lg:text-[2.6rem] md:text-[2.2rem]">
              Saúde conectada, <span className="text-[#0f172a]">simples</span> e
              segura
            </h1>

            <p className="text-lg text-[#64748b] mb-10 leading-relaxed max-w-120">
              A Life Med conecta pacientes e profissionais em uma plataforma
              moderna para agendamentos, prontuários e telemedicina.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register">
                <Button className="rounded-full px-8 py-3 font-semibold text-base leading-normal cursor-pointer transition-all inline-flex items-center justify-center border border-transparent bg-linear-to-br from-[#2563eb] to-[#0ea5e9] text-white shadow-[0_4px_6px_-1px_rgba(37,99,235,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_12px_-2px_rgba(37,99,235,0.35)] hover:brightness-110">
                  Criar Conta Gratuita
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button className="rounded-full px-8 py-3 font-semibold text-base leading-normal cursor-pointer transition-all inline-flex items-center justify-center border border-[#cbd5e1] bg-white text-[#0f172a] hover:bg-[#f1f5f9] hover:border-[#94a3b8]">
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>

          {/* Coluna direita: ilustração */}
          <div className="w-full lg:w-1/2 flex items-center justify-center relative">
            {/* Blob decorativo atrás da imagem */}
            <div
              className="absolute inset-0 m-auto w-[90%] h-[90%] rounded-[60%_40%_30%_70%/60%_30%_70%_40%] bg-linear-to-br from-[#dbeafe] to-[#e0f2fe] opacity-60"
              aria-hidden="true"
            />
            {/* Círculo pontilhado decorativo */}
            <div
              className="absolute right-0 top-4 w-28 h-28 rounded-full border-2 border-dashed border-[#bfdbfe] opacity-70"
              aria-hidden="true"
            />
            <div
              className="absolute left-2 bottom-8 w-16 h-16 rounded-full border-2 border-dashed border-[#bae6fd] opacity-60"
              aria-hidden="true"
            />

            <Image
              src="/undraw_doctors_djoj.svg"
              alt="Médicos da Life Med"
              width={520}
              height={420}
              className="relative z-10 w-full max-w-sm drop-shadow-[0_8px_24px_rgba(37,99,235,0.12)]"
              priority
            />
          </div>
        </section>

        {/* Cards de features */}
        <section className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 pb-20 md:pb-12">
          <div className="bg-white p-8 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] border border-[#e2e8f0] transition-all hover:-translate-y-1 hover:shadow-[0_10px_15px_-3px_rgba(37,99,235,0.08)] hover:border-[#bfdbfe]">
            <div className="w-11 h-11 rounded-xl bg-[#eff6ff] flex items-center justify-center mb-5">
              <svg
                className="w-6 h-6 text-[#2563eb]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-3 text-[#1e293b]">Pacientes</h2>
            <p className="text-[#64748b] leading-relaxed text-sm">
              Agende consultas, acompanhe seus atendimentos e tenha acesso ao
              seu histórico médico de forma simples e segura.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] border border-[#e2e8f0] transition-all hover:-translate-y-1 hover:shadow-[0_10px_15px_-3px_rgba(37,99,235,0.08)] hover:border-[#bfdbfe]">
            <div className="w-11 h-11 rounded-xl bg-[#eff6ff] flex items-center justify-center mb-5">
              <svg
                className="w-6 h-6 text-[#2563eb]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-3 text-[#1e293b]">
              Profissionais
            </h2>
            <p className="text-[#64748b] leading-relaxed text-sm">
              Gerencie agenda, pacientes, prontuários e consultas online em um
              único sistema.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] border border-[#e2e8f0] transition-all hover:-translate-y-1 hover:shadow-[0_10px_15px_-3px_rgba(37,99,235,0.08)] hover:border-[#bfdbfe]">
            <div className="w-11 h-11 rounded-xl bg-[#eff6ff] flex items-center justify-center mb-5">
              <svg
                className="w-6 h-6 text-[#2563eb]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-3 text-[#1e293b]">
              Telemedicina
            </h2>
            <p className="text-[#64748b] leading-relaxed text-sm">
              Atendimento remoto integrado, seguro e sem complicações técnicas.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
