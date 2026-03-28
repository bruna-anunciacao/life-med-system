import Link from "next/link";

export function InvalidTokenCard() {
  return (
    <div className="w-full px-4 py-8 flex items-start justify-center bg-[#f8fafc]">
      <div className="w-full max-w-[600px] p-10 flex flex-col items-center gap-4 rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
        <div className="text-red-600">
          Link inválido. Por favor, solicite a recuperação novamente.
        </div>
        <Link href="/auth/forgot-password" className="max-w-[100px] text-center w-full mt-2 py-3 rounded-full border-none font-semibold text-white bg-gradient-to-br from-[#2563eb] to-[#0ea5e9] transition-transform hover:-translate-y-px hover:brightness-110 active:translate-y-0 cursor-pointer inline-flex items-center justify-center no-underline">
          Voltar
        </Link>
      </div>
    </div>
  );
}
