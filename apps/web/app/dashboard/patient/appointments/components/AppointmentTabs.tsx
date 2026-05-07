import { TABS, TabKey, Appointment } from "../appointments.types";

type AppointmentTabsProps = {
  activeTab: TabKey;
  appointments: Appointment[];
  onTabChange: (tab: TabKey) => void;
};

const getTabCount = (appointments: Appointment[], tab: TabKey) => {
  switch (tab) {
    case "upcoming":
      return appointments.filter(
        (a) => a.status === "CONFIRMED" || a.status === "PENDING",
      ).length;
    case "past":
      return appointments.filter((a) => a.status === "COMPLETED").length;
    case "cancelled":
      return appointments.filter((a) => a.status === "CANCELLED").length;
  }
};

export function AppointmentTabs({
  activeTab,
  appointments,
  onTabChange,
}: AppointmentTabsProps) {
  return (
    <div className="mb-6 flex gap-1 border-b-2 border-gray-200 overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          title={`Visualizar ${tab.label.toLowerCase()}`}
          className={
            activeTab === tab.key
              ? "px-3 sm:px-6 py-3 border-none border-b-2 border-[#006fee] bg-none text-sm sm:text-[0.95rem] font-semibold text-[#006fee] cursor-pointer -mb-0.5 whitespace-nowrap"
              : "px-3 sm:px-6 py-3 border-none border-b-2 border-transparent bg-none text-sm sm:text-[0.95rem] font-medium text-gray-500 cursor-pointer transition-all duration-200 hover:text-gray-700 -mb-0.5 whitespace-nowrap"
          }
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
          <span
            className={
              activeTab === tab.key
                ? "ml-1.5 px-2 py-0.5 rounded-full bg-[rgba(0,111,238,0.1)] text-xs font-semibold text-[#006fee]"
                : "ml-1.5 px-2 py-0.5 rounded-full bg-gray-100 text-xs font-semibold"
            }
          >
            {getTabCount(appointments, tab.key)}
          </span>
        </button>
      ))}
    </div>
  );
}
