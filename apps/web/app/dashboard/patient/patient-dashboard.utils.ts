export const getInitials = (name: string) =>
  name
    .split(" ")
    .filter((n) => n.length > 2)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

export const formatDateLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
};

export const formatTimeRange = (dateStr: string) => {
  const date = new Date(dateStr);
  const end = new Date(date.getTime() + 30 * 60000);
  const fmt = (d: Date) =>
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${fmt(date)} - ${fmt(end)}`;
};

export const formatDay = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.getDate().toString().padStart(2, "0");
};

export const formatMonth = (dateStr: string) => {
  const date = new Date(dateStr);
  return date
    .toLocaleString("pt-BR", { month: "short" })
    .replace(".", "")
    .slice(0, 3);
};

export const formatShortDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
};

export const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
