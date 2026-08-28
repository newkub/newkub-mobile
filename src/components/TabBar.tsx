import { For } from "solid-js";
import { appStore, setActiveTab } from "../store/app";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";

const mdiMap: Record<string, string> = {
  Home: "i-mdi-home",
  Clock: "i-mdi-clock",
  AlarmClock: "i-mdi-alarm",
  CheckCircle2: "i-mdi-check-circle",
  CheckCircle: "i-mdi-check-circle",
  CheckSquare: "i-mdi-check-circle",
  Check: "i-mdi-check",
  Bot: "i-mdi-robot",
  StickyNote: "i-mdi-note",
  NotebookPen: "i-mdi-note",
  Bookmark: "i-mdi-bookmark",
  Mail: "i-mdi-email",
  Inbox: "i-mdi-email",
  Sparkles: "i-mdi-sparkles",
  Plus: "i-mdi-plus",
  Settings: "i-mdi-cog",
  X: "i-mdi-close",
  XCircle: "i-mdi-close-circle",
  Trash2: "i-mdi-delete",
  Send: "i-mdi-send",
  ExternalLink: "i-mdi-open-in-new",
  GitBranch: "i-mdi-source-branch",
  Cloud: "i-mdi-cloud",
  Image: "i-mdi-image",
  SlidersHorizontal: "i-mdi-tune",
  Bell: "i-mdi-bell",
  Key: "i-mdi-key",
  Wand2: "i-mdi-wand",
  Volume2: "i-mdi-volume-high",
  Play: "i-mdi-play",
  Pause: "i-mdi-pause",
  RotateCcw: "i-mdi-refresh",
  Circle: "i-mdi-circle",
  LayoutGrid: "i-mdi-view-grid",
  MoreHorizontal: "i-mdi-dots-horizontal",
  Save: "i-mdi-content-save",
  Search: "i-mdi-magnify",
  Timer: "i-mdi-timer",
  Hourglass: "i-mdi-timer-sand",
  Alarm: "i-mdi-alarm",
  Calendar: "i-mdi-calendar",
  CalendarClock: "i-mdi-calendar-clock",
  Repeat: "i-mdi-repeat",
  Flag: "i-mdi-flag",
  Share2: "i-mdi-share",
  Music: "i-mdi-music",
  Brain: "i-mdi-brain",
  Coffee: "i-mdi-coffee",
  Trophy: "i-mdi-trophy",
  Loader2: "i-mdi-loading",
  ChevronDown: "i-mdi-chevron-down",
  ChevronUp: "i-mdi-chevron-up",
  Info: "i-mdi-information",
  AlertCircle: "i-mdi-alert",
};

function tabIconClass(icon: string) {
  if (icon.startsWith("i-mdi-")) return icon;
  return mdiMap[icon] ?? "i-mdi-sparkles";
}

export function TabBar() {
  function activate(id: string) {
    haptic("light");
    setActiveTab(id);
  }

  function openAgent() {
    haptic("light");
    setActiveTab("agent");
    showStatus("Create a new tab with AI", "info");
  }

  const visibleTabs = () => appStore.tabs.filter((t) => t.visible && t.id !== "agent");

  return (
    <nav class="glass fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around rounded-t-3xl pb-safe">
      <For each={visibleTabs()}>
        {(tab) => {
          const active = tab.id === appStore.activeTab;
          return (
            <button
              onClick={() => activate(tab.id)}
              class={`relative flex flex-1 flex-col items-center justify-center gap-1 py-3 transition active:scale-95 ${
                active ? "text-primary" : "text-text-secondary"
              }`}
            >
              <span
                class={`${tabIconClass(tab.icon)} h-6 w-6 transition-transform duration-200 ${
                  active ? "opacity-100" : "opacity-80"
                }`}
              />
              <span class="text-[10px] font-medium">{tab.label}</span>
              {active && (
                <span class="absolute bottom-1 h-1 w-8 rounded-full bg-primary transition-all duration-200" />
              )}
            </button>
          );
        }}
      </For>
      <button
        onClick={openAgent}
        class={`relative flex flex-1 flex-col items-center justify-center gap-1 py-3 transition active:scale-95 ${
          appStore.activeTab === "agent" ? "text-primary" : "text-text-secondary"
        }`}
      >
        <span
          class={`i-mdi-plus h-6 w-6 ${
            appStore.activeTab === "agent" ? "opacity-100" : "opacity-80"
          }`}
        />
        <span class="text-[10px] font-medium">New</span>
      </button>
    </nav>
  );
}
