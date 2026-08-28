import { render } from "solid-js/web";
import "uno.css";
import "./theme.css";
import "./index.css";
import App from "./App";
import { initCapacitor } from "./lib/capacitor";
import { getUserId } from "./lib/sync";
import { setUserId, appStore, setAppStore } from "./store/app";
import { pullAlarms, pullReminders } from "./lib/sync";
import { startAlarmWatcher } from "./lib/notifications";

initCapacitor().catch(() => null);

const userId = getUserId();
setUserId(userId);

async function hydrate() {
  try {
    const [alarms, reminders] = await Promise.all([
      pullAlarms(userId),
      pullReminders(userId),
    ]);
    if (alarms.length) setAppStore("alarms", alarms);
    if (reminders.length) setAppStore("reminders", reminders);
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
const unsubscribe = (() => {
  // Solid stores don't have a subscribe function by default, so we use a MutationObserver-like
  // interval to check. In a real app we would wire this to a createEffect inside App.
  const interval = setInterval(() => {
    if (watcherStarted) return;
    if (appStore.alarms.length || appStore.reminders.length) {
      startAlarmWatcher(
        appStore.alarms.map((a) => ({ id: a.id, hour: a.hour, minute: a.minute, enabled: a.enabled, label: a.label })),
        appStore.reminders.map((r) => ({ id: r.id, date: r.date, time: r.time, enabled: r.enabled, title: r.title }))
      );
      watcherStarted = true;
    }
  }, 1000);
  return () => clearInterval(interval);
})();

setTimeout(() => {
  unsubscribe();
}, 5000);

const root = document.getElementById("root");
if (root) {
  render(() => <App />, root);
} else {
  // eslint-disable-next-line no-console
  console.error("Root element not found");
}
