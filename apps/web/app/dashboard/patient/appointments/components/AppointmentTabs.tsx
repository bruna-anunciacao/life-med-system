import { TABS, TabKey, Appointment } from "../appointments.types";
import styles from "../appointments.module.css";

type AppointmentTabsProps = {
  activeTab: TabKey;
  appointments: Appointment[];
  onTabChange: (tab: TabKey) => void;
};

const getTabCount = (appointments: Appointment[], tab: TabKey) => {
  switch (tab) {
    case "upcoming": return appointments.filter((a) => a.status === "CONFIRMED" || a.status === "PENDING").length;
    case "past": return appointments.filter((a) => a.status === "COMPLETED").length;
    case "cancelled": return appointments.filter((a) => a.status === "CANCELLED").length;
  }
};

export function AppointmentTabs({ activeTab, appointments, onTabChange }: AppointmentTabsProps) {
  return (
    <div className={styles.tabs}>
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={activeTab === tab.key ? styles.tabActive : styles.tab}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
          <span className={styles.tabCount}>{getTabCount(appointments, tab.key)}</span>
        </button>
      ))}
    </div>
  );
}
