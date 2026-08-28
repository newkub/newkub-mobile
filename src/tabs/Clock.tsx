import { useAppStore } from "../store/app";
import { AlarmTab as AlarmSub } from "./clock-sub/Alarm";
import { StopwatchTab as StopwatchSub } from "./clock-sub/Stopwatch";
import { TimerTab as TimerSub } from "./clock-sub/Timer";
import { PomodoroTab as PomodoroSub } from "./clock-sub/Pomodoro";
import { ReminderTab as ReminderSub } from "./clock-sub/Reminder";
import { haptic } from "../lib/capacitor";

const subTabs = [
  { id: "alarm", label: "Alarm" },
  { id: "stopwatch", label: "Stopwatch" },
  { id: "timer", label: "Timer" },
  { id: "pomodoro", label: "Pomodoro" },
  { id: "reminder", label: "Reminder" },
];

const subComponents: Record<string, React.ComponentType> = {
  alarm: AlarmSub,
  stopwatch: StopwatchSub,
  timer: TimerSub,
  pomodoro: PomodoroSub,
  reminder: ReminderSub,
};

export function ClockTab() {
  const subTab = useAppStore((s) => s.clockSubTab);
  const setClockSubTab = useAppStore((s) => s.setClockSubTab);

  const Component = subComponents[subTab] ?? AlarmSub;

  return (
    <div className="flex h-full flex-col px-4">
      <div className="glass mb-3 inline-flex justify-center gap-2 rounded-2xl p-1">
        {subTabs.map(({ id, label }) => {
          const active = id === subTab;
          return (
            <button
              key={id}
              onClick={() => { haptic("light"); setClockSubTab(id); }}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium capitalize transition ${
                active ? "bg-primary text-white" : "text-text-secondary hover:text-text"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-y-auto pb-6">
        <Component />
      </div>
    </div>
  );
}
