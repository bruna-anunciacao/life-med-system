import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { VulnerabilityBadge } from "@/components/shared/VulnerabilityBadge";
import type { ManagerPatientResponse } from "@/services/manager-service";

type VulnerablePatientsListProps = {
  patients: ManagerPatientResponse[];
};

/**
 * Lista os pacientes identificados como vulneráveis (top scores), conectando a
 * home ao foco do produto. Vazia, exibe um estado discreto e tranquilizador.
 */
export function VulnerablePatientsList({
  patients,
}: VulnerablePatientsListProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Pacientes vulneráveis
        </h2>
        <Link
          href="/dashboard/manager/patients"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Ver todos os pacientes
        </Link>
      </div>

      {patients.length === 0 ? (
        <EmptyState message="Nenhum paciente vulnerável identificado." />
      ) : (
        <Card className="bg-card">
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {patients.map((patient) => (
                <li
                  key={patient.id}
                  className="flex items-center justify-between gap-3 p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <p className="truncate font-medium text-foreground">
                      {patient.name}
                    </p>
                    <VulnerabilityBadge
                      totalScore={
                        (patient.patientProfile?.questionnaire ??
                          patient.questionnaire)?.totalScore ?? null
                      }
                      isVulnerable={
                        (patient.patientProfile?.questionnaire ??
                          patient.questionnaire)?.isVulnerable ?? null
                      }
                      className="shrink-0"
                    />
                  </div>
                  <Link
                    href={`/dashboard/manager/patients/${patient.id}`}
                    className="shrink-0 text-xs font-medium text-primary transition-colors hover:underline"
                  >
                    Ver
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
