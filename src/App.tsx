import { useState } from "react";
import { Header } from "./components/Header";
import { TabBar } from "./components/TabBar";
import { AlarmTab } from "./tabs/Alarm";
import { StopwatchTab } from "./tabs/Stopwatch";
import { TimerTab } from "./tabs/Timer";
import { PomodoroTab } from "./tabs/Pomodoro";
import { ReminderTab } from "./tabs/Reminder";
import { useAppStore } from "./store/app";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import { X, Settings } from "lucide-react";
import { haptic } from "./lib/capacitor";
import { OnboardingModal } from "./components/OnboardingModal";
import { LockScreen } from "./components/LockScreen";

const tabs = {
  alarm: AlarmTab,
  stopwatch: StopwatchTab,
  timer: TimerTab,
  pomodoro: PomodoroTab,
  reminder: ReminderTab,
};

export default function App() {
  const activeTab = useAppStore((s) => s.activeTab);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const Tab = tabs[activeTab];

  return (
    <div className="relative flex h-screen w-screen flex-col bg-bg">
      <div className="fixed right-4 top-0 z-50 pt-safe">
        <button
          onClick={() => { setSettingsOpen(true); haptic("light"); }}
          className="mt-4 rounded-full bg-surface-2 p-2.5 text-text-secondary transition hover:text-text"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
      <Header />
      <main className="flex-1 overflow-hidden pt-2">
        <Tab />
      </main>
      <TabBar />
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      <OnboardingModal />
      {!unlocked && <LockScreen onUnlock={() => setUnlocked(true)} />}
    </div>
  );
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const key = useAppStore((s) => s.elevenLabsKey);
  const setKey = useAppStore((s) => s.setElevenLabsKey);
  const [value, setValue] = useState(key);

  function save() {
    setKey(value);
    haptic("success");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-3xl bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Settings className="h-6 w-6 text-primary" /> Settings
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-text-secondary hover:text-text">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="rounded-2xl border border-border bg-surface-2 p-4">
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text">
            ElevenLabs API Key
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">for AI alarm sounds</span>
          </label>
          <Input
            type="text"
            value={value}
            onChange={setValue}
            placeholder="sk_..."
          />
          <p className="mt-2 text-xs text-muted">
            Stored locally on device. Never shared.
          </p>
        </div>
        <Button onClick={save} className="mt-5 w-full">Save</Button>
      </div>
    </div>
  );
}
