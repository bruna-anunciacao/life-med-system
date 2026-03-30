import { Loader2 } from "lucide-react";

export function VerifyEmailLoading() {
  return (
    <>
      <Loader2 className="mx-auto h-12 w-12 text-[#2563eb] animate-spin mb-4" />
      <h1 className="text-xl font-bold text-[#0f172a] mb-2">Verificando seu e-mail...</h1>
      <p className="text-sm text-[#64748b]">Aguarde um momento.</p>
    </>
  );
}
