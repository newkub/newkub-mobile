import { createSignal, Show } from "solid-js";
import { appStore, setFirstVisit, setElevenLabsKey } from "../store/app";
import { Button } from "./Button";
import { Input } from "./Input";
import { requestNotificationPermission } from "../lib/notifications";
import { haptic } from "../lib/capacitor";

export function OnboardingModal() {
  const [key, setKey] = createSignal(appStore.elevenLabsKey);

  async function enableNotifications() {
    await requestNotificationPermission();
    haptic("success");
  }

  function finish() {
    setElevenLabsKey(key());
    setFirstVisit(false);
    haptic("success");
  }

  return (
    <Show when={appStore.firstVisit}>
      <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
        <div class="w-full max-w-sm rounded-3xl bg-surface p-6">
          <h2 class="mb-2 text-center text-2xl font-bold">Welcome to Newkub Mobile</h2>
          <p class="mb-6 text-center text-text-secondary">
            Personal customizable app — Clock, Task, Devin, Notes, Saved, Email, AI tabs.
          </p>

          <div class="space-y-4">
            <div class="rounded-2xl bg-surface-2 p-4">
              <div class="mb-2 flex items-center gap-2 text-sm font-medium">
                <span class="i-mdi-bell h-4 w-4 text-primary" /> Notifications
              </div>
              <p class="text-xs text-text-secondary">Allow notifications to get alarm and reminder alerts.</p>
              <Button onClick={enableNotifications} class="mt-3 w-full" size="sm">
                Enable
              </Button>
            </div>

            <div class="rounded-2xl bg-surface-2 p-4">
              <div class="mb-2 flex items-center gap-2 text-sm font-medium">
                <span class="i-mdi-cloud h-4 w-4 text-success" /> Cloud Sync
              </div>
              <p class="text-xs text-text-secondary">Alarms and reminders sync across devices via Cloudflare D1.</p>
            </div>

            <div class="rounded-2xl bg-surface-2 p-4">
              <div class="mb-2 flex items-center gap-2 text-sm font-medium">
                <span class="i-mdi-key h-4 w-4 text-accent" /> ElevenLabs Key (optional)
              </div>
              <Input value={key()} onChange={setKey} placeholder="sk_..." />
              <p class="mt-2 text-xs text-text-secondary">Stored locally. Used to generate AI alarm voice.</p>
            </div>
          </div>

          <Button onClick={finish} class="mt-6 w-full">
            Get Started
          </Button>
        </div>
      </div>
    </Show>
  );
}
