import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { initCapacitor } from "./lib/capacitor";
import { getUserId, pullAlarms, pullReminders } from "./lib/sync";
import { useAppStore } from "./store/app";

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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
