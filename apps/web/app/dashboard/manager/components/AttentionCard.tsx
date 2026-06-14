import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type AttentionItem = {
  label: string;
  count: number;
  href: string;
};

type AttentionCardProps = {
  pendingAppointments: number;
  patientsWithoutQuestionnaire: number;
};

/**
 * Card-resumo acionável: atalhos para os itens que pedem atenção do gestor,
 * cada linha com contador em destaque e link para a tela correspondente.
 */
export function AttentionCard({
  pendingAppointments,
  patientsWithoutQuestionnaire,
}: AttentionCardProps) {
  const items: AttentionItem[] = [
    {
      label: "Consultas pendentes de confirmação",
      count: pendingAppointments,
      href: "/dashboard/manager/appointments",
    },
    {
      label: "Pacientes sem questionário",
      count: patientsWithoutQuestionnaire,
      href: "/dashboard/manager/patients",
    },
  ];

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Precisam de atenção
      </h2>
      <Card className="bg-card">
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 p-4 transition-colors hover:bg-muted"
                >
                  <span
                    className={`text-xl font-semibold tabular-nums ${
                      item.count > 0
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.count}
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-muted-foreground">
                    {item.label}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
