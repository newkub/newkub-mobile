import { createStore, produce } from "solid-js/store";
import { deleteAlarm, deleteReminder, pushAlarm, pushReminder } from "../lib/sync";
import type { Alarm, PomodoroSession, Reminder, TimerPreset } from "../types";

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

const STORAGE_KEY = "newkub-mobile-store";

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
  firstVisit: boolean;
  settingsOpen: boolean;
}

const initialState: AppState = {
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
  firstVisit: true,
  settingsOpen: false,
};

function loadState(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<AppState>;
    // ensure default tabs are not completely overwritten by malformed data
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

// Persist on every change in a non-blocking way
let persistTimer: ReturnType<typeof setTimeout> | null = null;
export function queuePersist() {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(persist, 200);
}

export { store as appStore, setStore as setAppStore };

// Actions
export function setActiveTab(tab: string) {
  setStore("activeTab", tab);
  setStore("lastVisitedTab", tab);
  queuePersist();
}

export function setClockSubTab(tab: string) {
  setStore("clockSubTab", tab);
  queuePersist();
}

export function addTab(tab: TabDefinition) {
  setStore(produce((s) => { s.tabs.push(tab); }));
  queuePersist();
}

export function removeTab(id: string) {
  if (["home", "clock"].includes(id)) return;
  setStore(produce((s) => { s.tabs = s.tabs.filter((t) => t.id !== id); }));
  queuePersist();
}

export function updateTab(id: string, patch: Partial<TabDefinition>) {
  setStore(
    "tabs",
    (tabs) => tabs.map((t) => (t.id === id ? { ...t, ...patch } as TabDefinition : t))
  );
  queuePersist();
}

export function setHomeWidgets(widgets: HomeWidget[]) {
  setStore("homeWidgets", widgets);
  queuePersist();
}

export function addHomeWidget(widget: HomeWidget) {
  setStore(produce((s) => { s.homeWidgets.push(widget); }));
  queuePersist();
}

export function removeHomeWidget(id: string) {
  setStore(
    "homeWidgets",
    (widgets) => widgets.filter((w) => w.id !== id)
  );
  queuePersist();
}

export function setGlobalSetting<K extends keyof GlobalSettings>(key: K, value: GlobalSettings[K]) {
  setStore("globalSettings", key, value);
  queuePersist();
}

export function setTabSetting(tabId: string, key: string, value: unknown) {
  setStore(produce((s) => {
    s.tabSettings[tabId] = s.tabSettings[tabId] ?? {};
    s.tabSettings[tabId][key] = value;
  }));
  queuePersist();
}

export function setStatus(status: StatusMessage) {
  setStore("status", status);
  if (status.type !== "error") {
    setTimeout(() => setStore("status", null), 3000);
  }
}

export function clearStatus() {
  setStore("status", null);
}

export function setUserId(id: string) {
  setStore("userId", id);
  queuePersist();
}

export function addAlarm(alarm: Alarm) {
  setStore(produce((s) => { s.alarms.push(alarm); }));
  if (store.userId) pushAlarm(store.userId, alarm).catch(() => null);
  queuePersist();
}

export function updateAlarm(id: string, patch: Partial<Alarm>) {
  setStore(
    "alarms",
    (alarms) => alarms.map((a) => (a.id === id ? { ...a, ...patch } as Alarm : a))
  );
  const updated = store.alarms.find((a) => a.id === id);
  if (updated && store.userId) pushAlarm(store.userId, updated).catch(() => null);
  queuePersist();
}

export function removeAlarm(id: string) {
  setStore("alarms", (alarms) => alarms.filter((a) => a.id !== id));
  if (store.userId) deleteAlarm(store.userId, id).catch(() => null);
  queuePersist();
}

export function toggleAlarm(id: string) {
  const alarm = store.alarms.find((a) => a.id === id);
  if (!alarm) return;
  updateAlarm(id, { enabled: !alarm.enabled });
}

export function addTimerPreset(preset: TimerPreset) {
  setStore(produce((s) => { s.timerPresets.push(preset); }));
  queuePersist();
}

export function removeTimerPreset(id: string) {
  setStore("timerPresets", (presets) => presets.filter((p) => p.id !== id));
  queuePersist();
}

export function addReminder(r: Reminder) {
  setStore(produce((s) => { s.reminders.push(r); }));
  if (store.userId) pushReminder(store.userId, r).catch(() => null);
  queuePersist();
}

export function updateReminder(id: string, patch: Partial<Reminder>) {
  setStore(
    "reminders",
    (reminders) => reminders.map((r) => (r.id === id ? { ...r, ...patch } as Reminder : r))
  );
  const updated = store.reminders.find((r) => r.id === id);
  if (updated && store.userId) pushReminder(store.userId, updated).catch(() => null);
  queuePersist();
}

export function removeReminder(id: string) {
  setStore("reminders", (reminders) => reminders.filter((r) => r.id !== id));
  if (store.userId) deleteReminder(store.userId, id).catch(() => null);
  queuePersist();
}

export function toggleReminder(id: string) {
  const r = store.reminders.find((x) => x.id === id);
  if (!r) return;
  updateReminder(id, { enabled: !r.enabled });
}

export function addPomodoroSession(session: PomodoroSession) {
  setStore(produce((s) => {
    const existing = s.pomodoroSessions.find((x) => x.date === session.date);
    if (existing) {
      existing.completedCycles += session.completedCycles;
      existing.totalFocusSeconds += session.totalFocusSeconds;
    } else {
      s.pomodoroSessions.push(session);
    }
  }));
  queuePersist();
}

export function setElevenLabsKey(key: string) {
  setStore("elevenLabsKey", key);
  queuePersist();
}

export function setFirstVisit(v: boolean) {
  setStore("firstVisit", v);
  queuePersist();
}

export function openSettings() {
  setStore("settingsOpen", true);
}

export function closeSettings() {
  setStore("settingsOpen", false);
}

export function resetStore() {
  setStore(initialState);
  queuePersist();
}
