type StatCardProps = {
  /** Rótulo discreto exibido abaixo do valor. */
  label: string;
  /** Valor em destaque exibido no topo do card. */
  value: number | string;
  /** Classe opcional para colorir o valor (ex.: cor semântica de status). */
  valueClassName?: string;
};

/**
 * Card de estatística minimalista: valor em destaque no topo e rótulo discreto
 * embaixo. Sem ícone, sem dot, sem barra — apenas tipografia e espaçamento.
 */
export function StatCard({
  label,
  value,
  valueClassName = "text-foreground",
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className={`text-2xl font-semibold ${valueClassName}`}>{value}</p>
      <p className="text-xs text-muted-foreground font-medium mt-1">{label}</p>
    </div>
  );
}
