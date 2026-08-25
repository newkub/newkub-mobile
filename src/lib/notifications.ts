import { LocalNotifications } from "@capacitor/local-notifications";
import { isNative } from "./capacitor";

export interface AlarmNotification {
  id: number;
  title: string;
  body: string;
  schedule: { at?: Date; every?: "day" | "week" | "month" | "year" | { hour: number; minute: number; }; };
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNative()) return true;
  const { display } = await LocalNotifications.requestPermissions();
  return display === "granted";
}

export async function checkPermission(): Promise<boolean> {
  if (!isNative()) return true;
  const { display } = await LocalNotifications.checkPermissions();
  return display === "granted";
}

export async function scheduleAlarm(alarm: AlarmNotification) {
  if (!isNative()) return;
  const every =
    typeof alarm.schedule.every === "string"
      ? alarm.schedule.every
      : undefined;

  await LocalNotifications.schedule({
    notifications: [
      {
        id: alarm.id,
        title: alarm.title,
        body: alarm.body,
        schedule: alarm.schedule.at
          ? { at: alarm.schedule.at, allowWhileIdle: true, every }
          : undefined,
        extra: { type: "alarm" },
      },
    ],
  });
}

export async function cancelAlarm(id: number) {
  if (!isNative()) return;
  await LocalNotifications.cancel({ notifications: [{ id }] });
}

export async function scheduleReminder(alarm: AlarmNotification) {
  if (!isNative()) return alarm.id;
  await scheduleAlarm(alarm);
  return alarm.id;
}

export async function cancelNotification(id: number) {
  if (!isNative()) return;
  await cancelAlarm(id);
}

export async function getPendingAlarms(): Promise<{ id: number; schedule?: Date; }[]> {
  if (!isNative()) return [];
  const { notifications } = await LocalNotifications.getPending();
  return notifications.map((n) => ({
    id: n.id,
    schedule: n.schedule?.at ? new Date(n.schedule.at) : undefined,
  }));
}
