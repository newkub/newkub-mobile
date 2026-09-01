import { For } from "solid-js";
import { appStore, setGlobalSetting } from "../../store/app";
import { Input } from "../Input";
import { Switch } from "../Switch";
import { Button } from "../Button";

type SettingsGlobalSectionProps = {
  elevenLabsKey: string;
  setElevenLabsKey: (v: string) => void;
  saveKey: () => void;
  setStartup: (tabId: string) => void;
  setClockDefault: (tab: string) => void;
};

export function SettingsGlobalSection(props: SettingsGlobalSectionProps) {
  return (
    <>
      <div class="rounded-2xl border border-border bg-surface-2 p-4">
        <h3 class="mb-3 flex items-center gap-2 font-semibold text-text">
          <span class="i-mdi-home h-4 w-4 text-primary" /> Startup tab
        </h3>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <For each={["home", "last", ...appStore.tabs.filter((t) => t.visible).map((t) => t.id)]}>
            {(id) => (
              <button
                onClick={() => props.setStartup(id)}
                class={`rounded-xl px-3 py-2 text-sm font-medium transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  appStore.globalSettings.startup === id
                    ? "bg-primary text-white"
                    : "bg-surface text-text-secondary hover:text-text"
                }`}
              >
                {id === "last" ? "Last used" : id === "home" ? "Home" : appStore.tabs.find((t) => t.id === id)?.label}
              </button>
            )}
          </For>
        </div>
      </div>

      <div class="rounded-2xl border border-border bg-surface-2 p-4">
        <h3 class="mb-3 flex items-center gap-2 font-semibold text-text">
          <span class="i-mdi-clock h-4 w-4 text-primary" /> Clock default sub-tab
        </h3>
        <div class="flex flex-wrap gap-2">
          <For each={["alarm", "stopwatch", "timer", "pomodoro", "reminder"]}>
            {(sub) => (
              <button
                onClick={() => props.setClockDefault(sub)}
                class={`rounded-xl px-3 py-2 text-sm font-medium capitalize transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  appStore.globalSettings.defaultClockSubTab === sub
                    ? "bg-primary text-white"
                    : "bg-surface text-text-secondary hover:text-text"
                }`}
              >
                {sub}
              </button>
            )}
          </For>
        </div>
      </div>

      <div class="rounded-2xl border border-border bg-surface-2 p-4">
        <h3 class="mb-3 font-semibold text-text">Preferences</h3>
        <div class="space-y-3">
          <label class="flex items-center justify-between">
            <span class="text-sm text-text-secondary">Haptics</span>
            <Switch
              checked={appStore.globalSettings.haptics}
              onChange={(v) => setGlobalSetting("haptics", v)}
              aria-label="Enable haptics"
            />
          </label>
          <label class="flex items-center justify-between">
            <span class="text-sm text-text-secondary">Status toast</span>
            <Switch
              checked={appStore.globalSettings.statusToast}
              onChange={(v) => setGlobalSetting("statusToast", v)}
              aria-label="Enable status toast"
            />
          </label>
          <label class="flex items-center justify-between">
            <span class="text-sm text-text-secondary">Notifications</span>
            <Switch
              checked={appStore.globalSettings.notifications}
              onChange={(v) => setGlobalSetting("notifications", v)}
              aria-label="Enable notifications"
            />
          </label>
        </div>
      </div>

      <div class="rounded-2xl border border-border bg-surface-2 p-4">
        <label class="mb-2 block text-sm font-medium text-text">ElevenLabs API Key</label>
        <Input type="text" value={props.elevenLabsKey} onChange={props.setElevenLabsKey} placeholder="sk_..." />
        <p class="mt-2 text-xs text-muted">Stored locally on device. Never shared.</p>
        <Button onClick={props.saveKey} class="mt-3 w-full" aria-label="Save ElevenLabs key">
          Save key
        </Button>
      </div>
    </>
  );
}
