import { produce } from "solid-js/store";
import { deleteAlarm, deleteReminder, pushAlarm, pushReminder } from "../lib/sync";
import type { Alarm, DevinSettings, PomodoroSession, Reminder, TimerPreset } from "../types";
import { appStore, initialState, setStore, queuePersist, type GlobalSettings, type HomeWidget, type TabDefinition } from "./app";

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

export function setStatus(status: { text: string; type: "info" | "success" | "warning" | "error" }) {
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
  if (appStore.userId) pushAlarm(appStore.userId, alarm).catch(() => null);
  queuePersist();
}

export function updateAlarm(id: string, patch: Partial<Alarm>) {
  setStore(
    "alarms",
    (alarms) => alarms.map((a) => (a.id === id ? { ...a, ...patch } as Alarm : a))
  );
  const updated = appStore.alarms.find((a) => a.id === id);
  if (updated && appStore.userId) pushAlarm(appStore.userId, updated).catch(() => null);
  queuePersist();
}

export function removeAlarm(id: string) {
  setStore("alarms", (alarms) => alarms.filter((a) => a.id !== id));
  if (appStore.userId) deleteAlarm(appStore.userId, id).catch(() => null);
  queuePersist();
}

export function toggleAlarm(id: string) {
  const alarm = appStore.alarms.find((a) => a.id === id);
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
  if (appStore.userId) pushReminder(appStore.userId, r).catch(() => null);
  queuePersist();
}

export function updateReminder(id: string, patch: Partial<Reminder>) {
  setStore(
    "reminders",
    (reminders) => reminders.map((r) => (r.id === id ? { ...r, ...patch } as Reminder : r))
  );
  const updated = appStore.reminders.find((r) => r.id === id);
  if (updated && appStore.userId) pushReminder(appStore.userId, updated).catch(() => null);
  queuePersist();
}

export function removeReminder(id: string) {
  setStore("reminders", (reminders) => reminders.filter((r) => r.id !== id));
  if (appStore.userId) deleteReminder(appStore.userId, id).catch(() => null);
  queuePersist();
}

export function toggleReminder(id: string) {
  const r = appStore.reminders.find((x) => x.id === id);
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

export function setDevinSettings(settings: Partial<DevinSettings>) {
  setStore(
    "devinSettings",
    (current) => ({ ...current, ...settings }) as DevinSettings,
  );
  queuePersist();
}

export function setActiveDevinSessionId(id: string | null) {
  setStore("activeDevinSessionId", id);
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
