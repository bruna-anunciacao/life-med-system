import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { ManagerPatientResponse } from "@/services/manager-service";

type RecentPatientsListProps = {
  patients: ManagerPatientResponse[];
};

const formatShortDate = (value: string) =>
  new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });

const getInitial = (name: string) => name.trim().charAt(0).toUpperCase() || "?";

/**
 * Cadastros recentes de pacientes, ordenados do mais novo ao mais antigo.
 * Apenas pacientes com `createdAt` disponível são exibidos.
 */
export function RecentPatientsList({ patients }: RecentPatientsListProps) {
  if (patients.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Cadastros recentes
        </h2>
        <Link
          href="/dashboard/manager/patients"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Ver todos
        </Link>
      </div>
      <Card className="bg-card">
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {patients.map((patient) => (
              <li key={patient.id}>
                <Link
                  href={`/dashboard/manager/patients/${patient.id}`}
                  className="flex items-center gap-3 p-4 transition-colors hover:bg-muted"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground"
                  >
                    {getInitial(patient.name)}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {patient.name}
                  </p>
                  {patient.createdAt && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatShortDate(patient.createdAt)}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
