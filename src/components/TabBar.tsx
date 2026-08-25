import { AlarmClock, Timer, Hourglass, Briefcase, ClipboardList } from "lucide-react";
import { useAppStore } from "../store/app";

const tabs = [
  { id: "alarm" as const, label: "Alarm", Icon: AlarmClock },
  { id: "stopwatch" as const, label: "Stopwatch", Icon: Timer },
  { id: "timer" as const, label: "Timer", Icon: Hourglass },
  { id: "pomodoro" as const, label: "Pomodoro", Icon: Briefcase },
  { id: "reminder" as const, label: "Reminder", Icon: ClipboardList },
];

export function TabBar() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  return (
    <nav className="glass fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around rounded-t-3xl pb-safe">
      {tabs.map(({ id, label, Icon }) => {
        const active = id === activeTab;
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-3 transition ${
              active ? "text-primary" : "text-text-secondary"
            }`}
          >
            <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{label}</span>
            {active && (
              <span className="absolute bottom-1 h-1 w-8 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
