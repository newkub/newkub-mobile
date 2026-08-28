import type { Alarm, Reminder } from "../types";

const API_BASE = "/api";

export function getUserId(): string {
  const fromStorage = localStorage.getItem("newkub-mobile-user-id");
  if (fromStorage) return fromStorage;
  const id = crypto.randomUUID();
  localStorage.setItem("newkub-mobile-user-id", id);
  return id;
}

async function syncAlarms(userId: string, alarms: Alarm[]) {
  for (const alarm of alarms) {
    await fetch(`${API_BASE}/alarms?userId=${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(alarm),
    });
  }
}

async function syncReminders(userId: string, reminders: Reminder[]) {
  for (const reminder of reminders) {
    await fetch(`${API_BASE}/reminders?userId=${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reminder),
    });
  }
}

export async function pullAlarms(userId: string): Promise<Alarm[]> {
  const res = await fetch(`${API_BASE}/alarms?userId=${userId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function pullReminders(userId: string): Promise<Reminder[]> {
  const res = await fetch(`${API_BASE}/reminders?userId=${userId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function pushAlarm(userId: string, alarm: Alarm) {
  try {
    await fetch(`${API_BASE}/alarms?userId=${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(alarm),
    });
  } catch {
    // offline / error: local-first
  }
}

export async function deleteAlarm(userId: string, id: string) {
  try {
    await fetch(`${API_BASE}/alarms?userId=${userId}&id=${id}`, { method: "DELETE" });
  } catch {
    // offline
  }
}

export async function pushReminder(userId: string, reminder: Reminder) {
  try {
    await fetch(`${API_BASE}/reminders?userId=${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reminder),
    });
  } catch {
    // offline
  }
}

export async function deleteReminder(userId: string, id: string) {
  try {
    await fetch(`${API_BASE}/reminders?userId=${userId}&id=${id}`, { method: "DELETE" });
  } catch {
    // offline
  }
}

export async function syncAll(userId: string, alarms: Alarm[], reminders: Reminder[]) {
  try {
    await syncAlarms(userId, alarms);
    await syncReminders(userId, reminders);
  } catch {
    // fail silently; local-first
  }
}
