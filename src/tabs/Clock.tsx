import { For, Match, Switch } from "solid-js";
import { appStore, setClockSubTab } from "../store/app";
import { AlarmTab } from "./clock-sub/Alarm";
import { StopwatchTab } from "./clock-sub/Stopwatch";
import { TimerTab } from "./clock-sub/Timer";
import { PomodoroTab } from "./clock-sub/Pomodoro";
import { ReminderTab } from "./clock-sub/Reminder";
import { haptic } from "../lib/capacitor";

const subTabs = [
  { id: "alarm", label: "Alarm" },
  { id: "stopwatch", label: "Stopwatch" },
  { id: "timer", label: "Timer" },
  { id: "pomodoro", label: "Pomodoro" },
  { id: "reminder", label: "Reminder" },
];

export function ClockTab() {
  return (
    <div class="flex h-full flex-col px-4">
      <div class="flex-1 overflow-y-auto pb-4">
        <Switch fallback={<AlarmTab />}>
          <Match when={appStore.clockSubTab === "alarm"}><AlarmTab /></Match>
          <Match when={appStore.clockSubTab === "stopwatch"}><StopwatchTab /></Match>
          <Match when={appStore.clockSubTab === "timer"}><TimerTab /></Match>
          <Match when={appStore.clockSubTab === "pomodoro"}><PomodoroTab /></Match>
          <Match when={appStore.clockSubTab === "reminder"}><ReminderTab /></Match>
        </Switch>
      </div>
      <div class="glass mt-3 inline-flex justify-center gap-2 rounded-2xl p-1 pb-safe">
        <For each={subTabs}>
          {({ id, label }) => {
            const active = () => id === appStore.clockSubTab;
            return (
              <button
                onClick={() => { haptic("light"); setClockSubTab(id); }}
                class={`rounded-xl px-3 py-1.5 text-xs font-medium capitalize transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  active() ? "bg-primary text-white" : "text-text-secondary hover:text-text"
                }`}
              >
                {label}
              </button>
            );
          }}
        </For>
      </div>
    </div>
  );
}
