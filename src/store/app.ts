import { create } from "zustand";
import { persist } from "zustand/middleware";
import { deleteAlarm, deleteReminder, pushAlarm, pushReminder } from "../lib/sync";
import type { Alarm, PomodoroSession, Reminder, TimerPreset } from "../types";

export * from "../types";

export interface AppState {
  activeTab: "alarm" | "stopwatch" | "timer" | "pomodoro" | "reminder";
  setActiveTab: (tab: AppState["activeTab"]) => void;

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
      activeTab: "alarm",
      setActiveTab: (tab) => set({ activeTab: tab }),

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
