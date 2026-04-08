import { Card, CardContent } from "@/components/ui/card";

export function HealthTipCard() {
  return (
    <Card className="border border-blue-100 bg-blue-50 py-0 gap-0">
      <CardContent className="flex gap-3 px-4 py-3">
        <div>
          <p className="text-xs font-semibold text-blue-700">Dica de Saúde</p>
          <p className="mt-1 text-xs leading-relaxed text-blue-600">
            Mantenha suas consultas em dia e não esqueça de verificar a
            disponibilidade dos profissionais regularmente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
