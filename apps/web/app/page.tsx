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
            <Button className="rounded-full px-6 py-3 font-semibold text-base leading-normal cursor-pointer transition-all inline-flex items-center justify-center border border-[#cbd5e1] bg-transparent text-[#2563eb] hover:bg-[#f1f5f9] hover:border-[#2563eb] hover:text-[#1d4ed8] md:w-full">
              Entrar
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-16 max-w-[1280px] mx-auto w-full">
        <section className="text-center max-w-[800px] mb-20 md:mb-12">
          <h1 className="text-[3.5rem] font-extrabold mb-6 tracking-tight bg-gradient-to-br from-[#2563eb] to-[#0ea5e9] bg-clip-text text-transparent md:text-[2.5rem]">
            Saúde conectada, simples e segura
          </h1>

          <p className="text-xl text-[#64748b] mb-10 leading-relaxed">
            A Life Med conecta pacientes e profissionais em uma plataforma
            moderna para agendamentos, prontuários e telemedicina.
          </p>

          <div className="flex gap-4 justify-center mt-8 md:flex-col md:w-full">
            <Link href="/auth/register">
              <Button className="rounded-full px-6 py-3 font-semibold text-base leading-normal cursor-pointer transition-all inline-flex items-center justify-center border border-transparent bg-gradient-to-br from-[#2563eb] to-[#0ea5e9] text-white shadow-[0_4px_6px_-1px_rgba(37,99,235,0.2)] hover:-translate-y-0.5 hover:shadow-[0_6px_8px_-1px_rgba(37,99,235,0.3)] hover:brightness-110 md:w-full">
                Criar Conta Gratuita
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 w-full">
          <div className="bg-white p-10 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] border border-[#e2e8f0] transition-all hover:-translate-y-1 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)] hover:border-[#cbd5e1]">
            <h2 className="text-2xl font-bold mb-4 text-[#1e293b]">Pacientes</h2>
            <p className="text-[#64748b] leading-relaxed">
              Agende consultas, acompanhe seus atendimentos e tenha acesso ao
              seu histórico médico de forma simples e segura.
            </p>
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] border border-[#e2e8f0] transition-all hover:-translate-y-1 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)] hover:border-[#cbd5e1]">
            <h2 className="text-2xl font-bold mb-4 text-[#1e293b]">Profissionais</h2>
            <p className="text-[#64748b] leading-relaxed">
              Gerencie agenda, pacientes, prontuários e consultas online em um
              único sistema.
            </p>
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] border border-[#e2e8f0] transition-all hover:-translate-y-1 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)] hover:border-[#cbd5e1]">
            <h2 className="text-2xl font-bold mb-4 text-[#1e293b]">Telemedicina</h2>
            <p className="text-[#64748b] leading-relaxed">
              Atendimento remoto integrado, seguro e sem complicações técnicas.
            </p>
          </div>
        </section>
      </main>

      <footer className="text-center p-8 text-[#94a3b8] text-sm border-t border-[#e2e8f0] bg-white">
        <p>© 2026 Life Med. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
