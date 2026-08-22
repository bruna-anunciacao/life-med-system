export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmada",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
  NO_SHOW: "Não compareceu",
};

// Mapeada com a paleta de status (fixa) do design system: verde/azul para
// estados positivos ou neutros, amarelo para o que exige ação, vermelho/laranja
// para os desfechos negativos — nunca reutilizada para outras séries.
export const APPOINTMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "var(--status-warning)",
  CONFIRMED: "var(--chart-1)",
  COMPLETED: "var(--status-good)",
  CANCELLED: "var(--status-critical)",
  NO_SHOW: "var(--status-serious)",
};

export const APPOINTMENT_MODALITY_LABELS: Record<string, string> = {
  VIRTUAL: "Virtual",
  HOME_VISIT: "Domiciliar",
  CLINIC: "Presencial (clínica)",
};

export const QUESTIONNAIRE_ANSWERED_BY_LABELS: Record<string, string> = {
  PATIENT: "Paciente",
  MANAGER: "Gestor",
};

export const USER_ROLE_LABELS: Record<string, string> = {
  PATIENT: "Paciente",
  PROFESSIONAL: "Profissional",
  ADMIN: "Admin",
  MANAGER: "Gestor",
};

export const USER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  COMPLETED: "Cadastro completo",
  VERIFIED: "Verificado",
  BLOCKED: "Bloqueado",
};

export const USER_STATUS_COLORS: Record<string, string> = {
  PENDING: "var(--status-warning)",
  COMPLETED: "var(--chart-1)",
  VERIFIED: "var(--status-good)",
  BLOCKED: "var(--status-critical)",
};

// Ordem fixa dos slots categóricos do design system — nunca ciclada por rank,
// sempre atribuída na ordem em que as categorias aparecem em cada gráfico.
export const CATEGORICAL_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
];

export function translateLabel(dict: Record<string, string>, key: string): string {
  return dict[key] ?? key;
}
