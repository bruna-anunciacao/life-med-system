import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Professional } from "../patient-dashboard.types";
import { getInitials } from "../patient-dashboard.utils";

type SuggestedDoctorsListProps = {
  professionals: Professional[];
  onViewAll: () => void;
  onBook: () => void;
};

export function SuggestedDoctorsList({
  professionals,
  onViewAll,
  onBook,
}: SuggestedDoctorsListProps) {
  return (
    <Card className="border border-gray-200 py-0 gap-0">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            Profissionais Disponíveis
          </h2>
          <button
            onClick={onViewAll}
            title="Ver a lista completa de profissionais disponíveis"
            className="text-xs font-medium text-blue-500 hover:text-blue-600"
          >
            Ver todos
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {professionals.length === 0 ? (
            <div
              className="py-4 text-center text-sm text-gray-400"
              title="Nenhum profissional disponível no momento"
            >
              Nenhum profissional disponível.
            </div>
          ) : (
            professionals.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white"
                  title={`Foto de perfil de ${doc.name}`}
                >
                  {getInitials(doc.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-medium text-gray-900"
                    title={`Profissional: ${doc.name}`}
                  >
                    {doc.name}
                  </p>
                  <p
                    className="text-xs text-gray-400"
                    title={`Especialidade: ${doc.professionalProfile?.specialities?.[0]?.name || "Não informada"}`}
                  >
                    {doc.professionalProfile?.specialities?.[0]?.name || ""}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="h-7 shrink-0 px-3 text-xs"
                  title={`Agendar consulta com ${doc.name}`}
                  onClick={onBook}
                >
                  Agendar
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
