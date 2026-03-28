import { Button } from "@/components/ui/button";
import { CalendarIcon } from "../../../../utils/icons";
import { TabKey } from "../appointments.types";

type EmptyAppointmentsProps = {
  activeTab: TabKey;
  onSearch: () => void;
};

export function EmptyAppointments({ activeTab, onSearch }: EmptyAppointmentsProps) {
  const title =
    activeTab === "upcoming"
      ? "Nenhuma consulta agendada"
      : activeTab === "past"
        ? "Nenhuma consulta realizada"
        : "Nenhuma consulta cancelada";

  const text =
    activeTab === "upcoming"
      ? "Busque um profissional para agendar sua consulta."
      : "Suas consultas aparecerão aqui.";

  return (
    <div className="py-16 px-8 flex flex-col items-center gap-3 text-center">
      <CalendarIcon />
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-sm text-gray-500">{text}</p>
      {activeTab === "upcoming" && (
        <Button className="mt-2 px-5 py-2 rounded-lg bg-[#006fee] font-semibold text-sm text-white cursor-pointer transition-all duration-200 hover:bg-[#0056b3]" onClick={onSearch}>
          Buscar Médicos
        </Button>
      )}
    </div>
  );
}
