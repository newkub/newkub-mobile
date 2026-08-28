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

  const visibleTabs = () => appStore.tabs.filter((t) => t.visible);

  return (
    <nav class="glass mx-4 mb-2 inline-flex max-w-full gap-1 rounded-2xl p-1 overflow-x-auto" aria-label="Main tabs">
      <For each={visibleTabs()}>
        {(tab) => {
          const active = () => tab.id === appStore.activeTab;
          return (
            <button
              onClick={() => activate(tab.id)}
              class={`inline-flex shrink-0 items-center gap-1.5 min-h-10 rounded-xl px-3 py-1.5 text-xs font-medium transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                active() ? "bg-primary text-white" : "text-text-secondary hover:text-text"
              }`}
              aria-current={active() ? "page" : undefined}
              aria-label={tab.label}
            >
              <span class={`${tabIconClass(tab.icon)} h-4 w-4`} aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        }}
      </For>
      <button
        onClick={openAgent}
        class={`inline-flex shrink-0 items-center gap-1.5 min-h-10 rounded-xl px-3 py-1.5 text-xs font-medium transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
          appStore.activeTab === "agent" ? "bg-primary text-white" : "text-text-secondary hover:text-text"
        }`}
        aria-label="New tab"
      >
        <span class="i-mdi-plus h-4 w-4" aria-hidden="true" />
        <span>New</span>
      </button>
    </nav>
  );
}
