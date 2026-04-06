import { Badge } from "@/components/ui/badge";

const userStatusMap: Record<string, { className: string; label: string }> = {
  VERIFIED: { className: "bg-green-100 text-green-700", label: "Verificado" },
  BLOCKED: { className: "bg-red-100 text-red-700", label: "Bloqueado" },
  PENDING: { className: "bg-yellow-100 text-yellow-700", label: "Pendente" },
  COMPLETED: { className: "bg-gray-100 text-gray-700", label: "Completo" },
};

const appointmentStatusMap: Record<string, { className: string; label: string }> = {
  PENDING: { className: "bg-yellow-100 text-yellow-800", label: "Pendente" },
  CONFIRMED: { className: "bg-blue-100 text-blue-800", label: "Confirmada" },
  COMPLETED: { className: "bg-green-100 text-green-800", label: "Concluída" },
  CANCELLED: { className: "bg-red-100 text-red-800", label: "Cancelada" },
  NO_SHOW: { className: "bg-gray-100 text-gray-800", label: "Não Compareceu" },
};

type StatusBadgeProps = {
  status: string;
  type?: "user" | "appointment";
  className?: string;
};

export function StatusBadge({ status, type = "user", className = "" }: StatusBadgeProps) {
  const map = type === "appointment" ? appointmentStatusMap : userStatusMap;
  const config = map[status] ?? { className: "bg-gray-100 text-gray-700", label: status };

  return (
    <Badge className={`px-4 ${config.className} ${className}`}>
      {config.label}
    </Badge>
  );
}
