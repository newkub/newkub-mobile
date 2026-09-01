import { createStore } from "solid-js/store";
import type { Alarm, DevinSettings, PomodoroSession, Reminder, TimerPreset } from "../types";

export * from "../types";

export interface TabDefinition {
  id: string;
  label: string;
  icon: string;
  visible: boolean;
  type: "home" | "clock" | "task" | "devin" | "notes" | "saved" | "email" | "agent" | "custom";
  settings?: Record<string, unknown>;
}

export interface HomeWidget {
  id: string;
  type: "clock" | "status" | "notes" | "saved" | "email" | "custom";
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  props?: Record<string, unknown>;
}

export interface GlobalSettings {
  startup: "home" | "last" | string;
  haptics: boolean;
  statusToast: boolean;
  notifications: boolean;
  defaultClockSubTab: string;
  customLogo: string; // "default" or a data URL
}

export interface StatusMessage {
  text: string;
  type: "info" | "success" | "warning" | "error";
}

const STORAGE_KEY = "wrikka-mobile-store";

const defaultTabs: TabDefinition[] = [
  { id: "home", label: "Home", icon: "i-mdi-home", visible: true, type: "home" },
  { id: "clock", label: "Clock", icon: "i-mdi-clock", visible: true, type: "clock" },
  { id: "task", label: "Task", icon: "i-mdi-check-circle", visible: true, type: "task" },
  { id: "devin", label: "Devin", icon: "i-mdi-robot", visible: true, type: "devin" },
  { id: "notes", label: "Notes", icon: "i-mdi-note", visible: true, type: "notes" },
  { id: "saved", label: "Saved", icon: "i-mdi-bookmark", visible: true, type: "saved" },
  { id: "email", label: "Email", icon: "i-mdi-email", visible: true, type: "email" },
  { id: "agent", label: "New Tab", icon: "i-mdi-sparkles", visible: true, type: "agent" },
];

const defaultGlobal: GlobalSettings = {
  startup: "home",
  haptics: true,
  statusToast: true,
  notifications: true,
  defaultClockSubTab: "alarm",
  customLogo: "default",
};

const defaultPresets: TimerPreset[] = [
  { id: "p1", name: "3 min", seconds: 180, color: "#22c55e" },
  { id: "p2", name: "5 min", seconds: 300, color: "#3b82f6" },
  { id: "p3", name: "10 min", seconds: 600, color: "#a855f7" },
  { id: "p4", name: "15 min", seconds: 900, color: "#f59e0b" },
  { id: "p5", name: "25 min", seconds: 1500, color: "#6366f1" },
];

export interface AppState {
  activeTab: string;
  lastVisitedTab: string;
  clockSubTab: string;
  tabs: TabDefinition[];
  homeWidgets: HomeWidget[];
  globalSettings: GlobalSettings;
  tabSettings: Record<string, Record<string, unknown>>;
  status: StatusMessage | null;
  userId: string;
  alarms: Alarm[];
  timerPresets: TimerPreset[];
  reminders: Reminder[];
  pomodoroSessions: PomodoroSession[];
  elevenLabsKey: string;
  devinSettings: DevinSettings;
  activeDevinSessionId: string | null;
  firstVisit: boolean;
  settingsOpen: boolean;
}

export const initialState: AppState = {
  activeTab: "home",
  lastVisitedTab: "home",
  clockSubTab: "alarm",
  tabs: defaultTabs,
  homeWidgets: [],
  globalSettings: defaultGlobal,
  tabSettings: {},
  status: null,
  userId: "",
  alarms: [],
  timerPresets: defaultPresets,
  reminders: [],
  pomodoroSessions: [],
  elevenLabsKey: "",
  devinSettings: {
    orgId: "",
    apiKey: "",
    useProxy: true,
    notifyCompleted: true,
    notifyWaiting: true,
  },
  activeDevinSessionId: null,
  firstVisit: true,
  settingsOpen: false,
};

function loadState(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (!Array.isArray(parsed.tabs) || parsed.tabs.length === 0) {
      parsed.tabs = defaultTabs;
    }
    return parsed;
  } catch {
    return {};
  }
}

function mergeWithDefault(loaded: Partial<AppState>): AppState {
  return {
    ...initialState,
    ...loaded,
    globalSettings: { ...defaultGlobal, ...loaded.globalSettings },
    tabSettings: loaded.tabSettings ?? {},
  };
}

const [store, setStore] = createStore<AppState>(mergeWithDefault(loadState()));

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;
export function queuePersist() {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(persist, 200);
}

export { store as appStore, setStore };
export const setAppStore = setStore;

export * from "./actions";
