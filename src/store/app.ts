import { create } from "zustand";
import { persist } from "zustand/middleware";
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

const defaultTabs: TabDefinition[] = [
  { id: "home", label: "Home", icon: "Home", visible: true, type: "home" },
  { id: "clock", label: "Clock", icon: "Clock", visible: true, type: "clock" },
  { id: "task", label: "Task", icon: "CheckCircle2", visible: true, type: "task" },
  { id: "devin", label: "Devin", icon: "Bot", visible: true, type: "devin" },
  { id: "notes", label: "Notes", icon: "StickyNote", visible: true, type: "notes" },
  { id: "saved", label: "Saved", icon: "Bookmark", visible: true, type: "saved" },
  { id: "email", label: "Email", icon: "Mail", visible: true, type: "email" },
  { id: "agent", label: "New Tab", icon: "Sparkles", visible: true, type: "agent" },
];

const defaultGlobal: GlobalSettings = {
  startup: "home",
  haptics: true,
  statusToast: true,
  notifications: true,
  defaultClockSubTab: "alarm",
  customLogo: "default",
};

export interface AppState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lastVisitedTab: string;

  clockSubTab: string;
  setClockSubTab: (tab: string) => void;

  tabs: TabDefinition[];
  addTab: (tab: TabDefinition) => void;
  removeTab: (id: string) => void;
  updateTab: (id: string, patch: Partial<TabDefinition>) => void;

  homeWidgets: HomeWidget[];
  setHomeWidgets: (widgets: HomeWidget[]) => void;
  addHomeWidget: (widget: HomeWidget) => void;
  removeHomeWidget: (id: string) => void;

  globalSettings: GlobalSettings;
  setGlobalSetting: <K extends keyof GlobalSettings>(key: K, value: GlobalSettings[K]) => void;

  tabSettings: Record<string, Record<string, unknown>>;
  setTabSetting: (tabId: string, key: string, value: unknown) => void;

  status: StatusMessage | null;
  setStatus: (status: StatusMessage) => void;
  clearStatus: () => void;

  userId: string;
  setUserId: (id: string) => void;

  alarms: Alarm[];
  addAlarm: (alarm: Alarm) => void;
  updateAlarm: (id: string, patch: Partial<Alarm>) => void;
  removeAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;

  timerPresets: TimerPreset[];
  addTimerPreset: (preset: TimerPreset) => void;
  removeTimerPreset: (id: string) => void;

  reminders: Reminder[];
  addReminder: (r: Reminder) => void;
  updateReminder: (id: string, patch: Partial<Reminder>) => void;
  removeReminder: (id: string) => void;
  toggleReminder: (id: string) => void;

  pomodoroSessions: PomodoroSession[];
  addPomodoroSession: (s: PomodoroSession) => void;

  elevenLabsKey: string;
  setElevenLabsKey: (key: string) => void;

  firstVisit: boolean;
  setFirstVisit: (v: boolean) => void;
}

const defaultPresets: TimerPreset[] = [
  { id: "p1", name: "3 min", seconds: 180, color: "#22c55e" },
  { id: "p2", name: "5 min", seconds: 300, color: "#3b82f6" },
  { id: "p3", name: "10 min", seconds: 600, color: "#a855f7" },
  { id: "p4", name: "15 min", seconds: 900, color: "#f59e0b" },
  { id: "p5", name: "25 min", seconds: 1500, color: "#6366f1" },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeTab: "home",
      setActiveTab: (tab) =>
        set(() => ({
          activeTab: tab,
          lastVisitedTab: tab,
        })),
      lastVisitedTab: "home",

      clockSubTab: "alarm",
      setClockSubTab: (tab) => set({ clockSubTab: tab }),

      tabs: defaultTabs,
      addTab: (tab) =>
        set((s) => ({ tabs: [...s.tabs, tab] })),
      removeTab: (id) =>
        set((s) => {
          if (["home", "clock"].includes(id)) return s;
          const next = s.tabs.filter((t) => t.id !== id);
          return { tabs: next };
        }),
      updateTab: (id, patch) =>
        set((s) => ({
          tabs: s.tabs.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      homeWidgets: [],
      setHomeWidgets: (widgets) => set({ homeWidgets: widgets }),
      addHomeWidget: (widget) =>
        set((s) => ({ homeWidgets: [...s.homeWidgets, widget] })),
      removeHomeWidget: (id) =>
        set((s) => ({ homeWidgets: s.homeWidgets.filter((w) => w.id !== id) })),

      globalSettings: defaultGlobal,
      setGlobalSetting: (key, value) =>
        set((s) => ({
          globalSettings: { ...s.globalSettings, [key]: value },
        })),

      tabSettings: {},
      setTabSetting: (tabId, key, value) =>
        set((s) => ({
          tabSettings: {
            ...s.tabSettings,
            [tabId]: { ...(s.tabSettings[tabId] ?? {}), [key]: value },
          },
        })),

      status: null,
      setStatus: (status) => set({ status }),
      clearStatus: () => set({ status: null }),

      userId: "",
      setUserId: (id) => set({ userId: id }),

      alarms: [],
      addAlarm: (alarm) =>
        set((s) => {
          if (s.userId) pushAlarm(s.userId, alarm).catch(() => null);
          return { alarms: [...s.alarms, alarm] };
        }),
      updateAlarm: (id, patch) =>
        set((s) => {
          const next = s.alarms.map((a) => (a.id === id ? { ...a, ...patch } : a));
          const updated = next.find((a) => a.id === id);
          if (updated && s.userId) pushAlarm(s.userId, updated).catch(() => null);
          return { alarms: next };
        }),
      removeAlarm: (id) =>
        set((s) => {
          if (s.userId) deleteAlarm(s.userId, id).catch(() => null);
          return { alarms: s.alarms.filter((a) => a.id !== id) };
        }),
      toggleAlarm: (id) =>
        set((s) => {
          const next = s.alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a));
          const updated = next.find((a) => a.id === id);
          if (updated && s.userId) pushAlarm(s.userId, updated).catch(() => null);
          return { alarms: next };
        }),

      timerPresets: defaultPresets,
      addTimerPreset: (preset) =>
        set((s) => ({ timerPresets: [...s.timerPresets, preset] })),
      removeTimerPreset: (id) =>
        set((s) => ({ timerPresets: s.timerPresets.filter((p) => p.id !== id) })),

      reminders: [],
      addReminder: (r) =>
        set((s) => {
          if (s.userId) pushReminder(s.userId, r).catch(() => null);
          return { reminders: [...s.reminders, r] };
        }),
      updateReminder: (id, patch) =>
        set((s) => {
          const next = s.reminders.map((r) => (r.id === id ? { ...r, ...patch } : r));
          const updated = next.find((r) => r.id === id);
          if (updated && s.userId) pushReminder(s.userId, updated).catch(() => null);
          return { reminders: next };
        }),
      removeReminder: (id) =>
        set((s) => {
          if (s.userId) deleteReminder(s.userId, id).catch(() => null);
          return { reminders: s.reminders.filter((r) => r.id !== id) };
        }),
      toggleReminder: (id) =>
        set((s) => {
          const next = s.reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
          const updated = next.find((r) => r.id === id);
          if (updated && s.userId) pushReminder(s.userId, updated).catch(() => null);
          return { reminders: next };
        }),

      pomodoroSessions: [],
      addPomodoroSession: (session) =>
        set((s) => {
          const existing = s.pomodoroSessions.find((x) => x.date === session.date);
          if (existing) {
            return {
              pomodoroSessions: s.pomodoroSessions.map((x) =>
                x.date === session.date
                  ? {
                    ...x,
                    completedCycles: x.completedCycles + session.completedCycles,
                    totalFocusSeconds: x.totalFocusSeconds + session.totalFocusSeconds,
                  }
                  : x
              ),
            };
          }
          return { pomodoroSessions: [...s.pomodoroSessions, session] };
        }),

      elevenLabsKey: "",
      setElevenLabsKey: (key) => set({ elevenLabsKey: key }),

      firstVisit: true,
      setFirstVisit: (v) => set({ firstVisit: v }),
    }),
    { name: "newkub-mobile-store" }
  )
);
