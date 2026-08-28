import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { initCapacitor } from "./lib/capacitor";
import { getUserId, pullAlarms, pullReminders } from "./lib/sync";
import { useAppStore } from "./store/app";
import { startAlarmWatcher } from "./lib/notifications";

initCapacitor();

const userId = getUserId();
useAppStore.setState({ userId });

async function hydrate() {
  try {
    const [alarms, reminders] = await Promise.all([
      pullAlarms(userId),
      pullReminders(userId),
    ]);
    if (alarms.length) useAppStore.setState({ alarms });
    if (reminders.length) useAppStore.setState({ reminders });
  } catch {
    // offline or not yet deployed; keep local state
  }
}

hydrate();

// Register service worker for PWA notifications
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch(() => null);
  });
}

// Start a simple watcher for web notifications
let watcherStarted = false;
const unsubscribe = useAppStore.subscribe((s) => {
  if (watcherStarted) return;
  if (s.alarms.length || s.reminders.length) {
    startAlarmWatcher(
      s.alarms.map((a) => ({ id: a.id, hour: a.hour, minute: a.minute, enabled: a.enabled, label: a.label })),
      s.reminders.map((r) => ({ id: r.id, date: r.date, time: r.time, enabled: r.enabled, title: r.title }))
    );
    watcherStarted = true;
  }
});

setTimeout(() => {
  unsubscribe();
}, 5000);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
