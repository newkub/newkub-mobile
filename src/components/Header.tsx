import { Bell, Plus } from "lucide-react";
import { useAppStore } from "../store/app";

export function Header() {
  const activeTab = useAppStore((s) => s.activeTab);
  const now = new Date();

  const titles: Record<string, string> = {
    alarm: "Good Morning",
    stopwatch: "Stopwatch",
    timer: "Timer",
    pomodoro: "Focus",
    reminder: "Reminders",
  };

  return (
    <header className="flex items-center justify-between px-5 pt-safe pt-4 pb-2">
      <div>
        <h1 className="text-xl font-bold text-text">{titles[activeTab]}</h1>
        <p className="text-sm text-text-secondary">
          {now.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>
      <div className="flex gap-2">
        <button className="rounded-full bg-surface-2 p-3 text-text-secondary hover:text-text">
          <Bell className="h-5 w-5" />
        </button>
        <button className="rounded-full bg-primary p-3 text-white hover:bg-primary-glow">
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
