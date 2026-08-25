import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Day = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";

export interface Alarm {
  id: string;
  hour: number;
  minute: number;
  label: string;
  enabled: boolean;
  repeat: Day[];
  sound: "beep" | "bell" | "ai";
  soundUrl?: string;
  aiText?: string;
}

export interface TimerPreset {
  id: string;
  name: string;
  seconds: number;
  color: string;
}

export interface Reminder {
  id: string;
  title: string;
  date: string; // ISO date
  time: string; // HH:MM
  repeat: "none" | "daily" | "weekly" | "monthly";
  enabled: boolean;
  createdAt: number;
}

export interface PomodoroSession {
  date: string;
  completedCycles: number;
  totalFocusSeconds: number;
}

export interface AppState {
  activeTab: "alarm" | "stopwatch" | "timer" | "pomodoro" | "reminder";
  setActiveTab: (tab: AppState["activeTab"]) => void;

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
      activeTab: "alarm",
      setActiveTab: (tab) => set({ activeTab: tab }),

      alarms: [],
      addAlarm: (alarm) => set((s) => ({ alarms: [...s.alarms, alarm] })),
      updateAlarm: (id, patch) =>
        set((s) => ({
          alarms: s.alarms.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      removeAlarm: (id) => set((s) => ({ alarms: s.alarms.filter((a) => a.id !== id) })),
      toggleAlarm: (id) =>
        set((s) => ({
          alarms: s.alarms.map((a) =>
            a.id === id ? { ...a, enabled: !a.enabled } : a
          ),
        })),

      timerPresets: defaultPresets,
      addTimerPreset: (preset) =>
        set((s) => ({ timerPresets: [...s.timerPresets, preset] })),
      removeTimerPreset: (id) =>
        set((s) => ({ timerPresets: s.timerPresets.filter((p) => p.id !== id) })),

      reminders: [],
      addReminder: (r) => set((s) => ({ reminders: [...s.reminders, r] })),
      updateReminder: (id, patch) =>
        set((s) => ({
          reminders: s.reminders.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      removeReminder: (id) =>
        set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),
      toggleReminder: (id) =>
        set((s) => ({
          reminders: s.reminders.map((r) =>
            r.id === id ? { ...r, enabled: !r.enabled } : r
          ),
        })),

      pomodoroSessions: [],
      addPomodoroSession: (session) =>
        set((s) => ({ pomodoroSessions: [...s.pomodoroSessions, session] })),

      elevenLabsKey: "",
      setElevenLabsKey: (key) => set({ elevenLabsKey: key }),

      firstVisit: true,
      setFirstVisit: (v) => set({ firstVisit: v }),
    }),
    { name: "new-habbit-store" }
  )
);
