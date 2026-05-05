import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LifeMedLogo } from "../../../ui/life-med-logo";

export function InvalidTokenCard() {
  return (
    <div className="w-full max-w-96 sm:max-w-105 flex flex-col gap-5">
      <div className="flex flex-col">
        <Link 
          href="/" 
          className="w-fit mb-3"
          title="Voltar para a página inicial"
        >
          <LifeMedLogo width={160} className="h-auto" />
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-sm text-[#dc2626] font-medium">
          Link inválido ou expirado. Por favor, solicite a recuperação novamente.
        </p>
        <Link href="/auth/forgot-password">
          <Button 
            size="lg" 
            className="w-full"
            title="Ir para a tela de solicitação de novo link de recuperação"
          >
            Solicitar novo link
          </Button>
        </Link>
      </div>
    </div>
  );
}