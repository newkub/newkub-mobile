import {
  AlarmClock,
  Bookmark,
  Bot,
  CheckCircle2,
  CheckSquare,
  Clock,
  Home,
  Inbox,
  Mail,
  NotebookPen,
  Plus,
  Sparkles,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import { useAppStore } from "../store/app";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";

const iconMap: Record<string, LucideIcon> = {
  Home,
  Clock,
  AlarmClock,
  CheckCircle2,
  CheckSquare,
  Bot,
  StickyNote,
  NotebookPen,
  Bookmark,
  Mail,
  Inbox,
  Sparkles,
  Plus,
};

export function TabBar() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const tabs = useAppStore((s) => s.tabs.filter((t) => t.visible && t.id !== "agent"));

  function activate(id: string) {
    haptic("light");
    setActiveTab(id);
  }

  function openAgent() {
    haptic("light");
    setActiveTab("agent");
    showStatus("Create a new tab with AI", "info");
  }

  return (
    <nav className="glass fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around rounded-t-3xl pb-safe">
      {tabs.map(({ id, label, icon }) => {
        const active = id === activeTab;
        const Icon = iconMap[icon] ?? Sparkles;
        return (
          <button
            key={id}
            onClick={() => activate(id)}
            className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-3 transition active:scale-95 ${
              active ? "text-primary" : "text-text-secondary"
            }`}
          >
            <Icon className="h-6 w-6 transition-transform duration-200" strokeWidth={active ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{label}</span>
            {active && (
              <span className="absolute bottom-1 h-1 w-8 rounded-full bg-primary transition-all duration-200" />
            )}
          </button>
        );
      })}
      <button
        onClick={openAgent}
        className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-3 transition active:scale-95 ${
          activeTab === "agent" ? "text-primary" : "text-text-secondary"
        }`}
      >
        <Plus className="h-6 w-6" strokeWidth={activeTab === "agent" ? 2.5 : 2} />
        <span className="text-[10px] font-medium">New</span>
      </button>
    </nav>
  );
}
