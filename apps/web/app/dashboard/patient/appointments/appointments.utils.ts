export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return {
    day: date.getDate().toString().padStart(2, "0"),
    month: date.toLocaleString("pt-BR", { month: "short" }).replace(".", ""),
    year: date.getFullYear().toString(),
  };
};

export const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "CONFIRMED": return "Confirmada";
    case "PENDING": return "Pendente";
    case "COMPLETED": return "Realizada";
    case "CANCELLED": return "Cancelada";
    default: return status;
  }
};

export const getStatusClass = (status: string) => {
  switch (status) {
    case "CONFIRMED": return "bg-green-100 text-green-700";
    case "PENDING": return "bg-yellow-100 text-yellow-700";
    case "COMPLETED": return "bg-blue-100 text-blue-700";
    case "CANCELLED": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

export const getModalityLabel = (modality: string) => {
  switch (modality) {
    case "VIRTUAL": return "Online";
    case "HOME_VISIT": return "Domiciliar";
    case "CLINIC": return "Presencial";
    default: return modality;
  }
};

export const getCardStatusClass = (status: string) => {
  switch (status) {
    case "CONFIRMED": return "border-l-4 border-l-[#006fee]";
    case "PENDING": return "border-l-4 border-l-[#f5a524]";
    case "COMPLETED": return "border-l-4 border-l-[#17c964]";
    case "CANCELLED": return "border-l-4 border-l-[#f31260]";
    default: return "";
  }
};
