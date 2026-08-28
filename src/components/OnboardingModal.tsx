import { useAppStore } from "../store/app";
import { Button } from "./Button";
import { Input } from "./Input";
import { Bell, Cloud, Key } from "lucide-react";
import { requestNotificationPermission } from "../lib/notifications";
import { haptic } from "../lib/capacitor";

export function OnboardingModal() {
  const firstVisit = useAppStore((s) => s.firstVisit);
  const setFirstVisit = useAppStore((s) => s.setFirstVisit);
  const elevenLabsKey = useAppStore((s) => s.elevenLabsKey);
  const setElevenLabsKey = useAppStore((s) => s.setElevenLabsKey);

  if (!firstVisit) return null;

  async function enableNotifications() {
    await requestNotificationPermission();
    haptic("success");
  }

  function finish() {
    setFirstVisit(false);
    haptic("success");
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-surface p-6">
        <h2 className="mb-2 text-center text-2xl font-bold">Welcome to Newkub Mobile</h2>
        <p className="mb-6 text-center text-text-secondary">
          Personal customizable app — Clock, Task, Devin, Notes, Saved, Email, AI tabs.
        </p>

        <div className="space-y-4">
          <div className="rounded-2xl bg-surface-2 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Bell className="h-4 w-4 text-primary" /> Notifications
            </div>
            <p className="text-xs text-text-secondary">Allow notifications to get alarm and reminder alerts.</p>
            <Button onClick={enableNotifications} className="mt-3 w-full" size="sm">
              Enable
            </Button>
          </div>

          <div className="rounded-2xl bg-surface-2 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Cloud className="h-4 w-4 text-success" /> Cloud Sync
            </div>
            <p className="text-xs text-text-secondary">Alarms and reminders sync across devices via Cloudflare D1.</p>
          </div>

          <div className="rounded-2xl bg-surface-2 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Key className="h-4 w-4 text-accent" /> ElevenLabs Key (optional)
            </div>
            <Input value={elevenLabsKey} onChange={setElevenLabsKey} placeholder="sk_..." />
            <p className="mt-2 text-xs text-text-secondary">Stored locally. Used to generate AI alarm voice.</p>
          </div>
        </div>

        <Button onClick={finish} className="mt-6 w-full">
          Get Started
        </Button>
      </div>
    </div>
  );
}
