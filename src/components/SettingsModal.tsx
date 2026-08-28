import { createSignal, For, Show } from "solid-js";
import {
  appStore,
  setGlobalSetting,
  updateTab,
  setElevenLabsKey,
  setActiveTab,
  setClockSubTab,
  type TabDefinition,
} from "../store/app";
import { Button } from "./Button";
import { Input } from "./Input";
import { Switch } from "./Switch";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";

type Section = "global" | "tabs" | "logo" | "tab";

const sections: { id: Section; label: string; icon: string }[] = [
  { id: "global", label: "Global", icon: "i-mdi-tune" },
  { id: "tabs", label: "Tabs", icon: "i-mdi-home" },
  { id: "logo", label: "Logo", icon: "i-mdi-image" },
  { id: "tab", label: "Per-Tab", icon: "i-mdi-clock" },
];

export function SettingsModal(props: { onClose: () => void }) {
  const [section, setSection] = createSignal<Section>("global");
  const [key, setKey] = createSignal(appStore.elevenLabsKey);

  function saveKey() {
    setElevenLabsKey(key());
    showStatus("ElevenLabs key saved", "success");
  }

  function toggleTab(tab: TabDefinition) {
    if (["home", "clock"].includes(tab.id)) {
      showStatus("Home and Clock tabs cannot be hidden", "warning");
      return;
    }
    updateTab(tab.id, { visible: !tab.visible });
    haptic(tab.visible ? "light" : "success");
  }

  function setStartup(tabId: string) {
    setGlobalSetting("startup", tabId as any);
    showStatus(`Startup tab set to ${appStore.tabs.find((t) => t.id === tabId)?.label ?? tabId}`, "success");
  }

  function setClockDefault(tab: string) {
    setClockSubTab(tab);
    setGlobalSetting("defaultClockSubTab", tab as any);
  }

  return (
    <div class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div class="h-[85vh] w-full max-w-2xl rounded-t-3xl bg-surface p-6 sm:h-auto sm:rounded-3xl">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="flex items-center gap-2 text-xl font-bold text-text">
            <span class="i-mdi-cog h-6 w-6 text-primary" /> Settings
          </h2>
          <button onClick={props.onClose} class="rounded-full p-2 text-text-secondary hover:text-text">
            <span class="i-mdi-close h-5 w-5" />
          </button>
        </div>

        <div class="mb-4 flex gap-2 overflow-x-auto pb-2">
          <For each={sections}>
            {(s) => {
              const active = section() === s.id;
              return (
                <button
                  onClick={() => setSection(s.id)}
                  class={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                    active ? "bg-primary text-white" : "bg-surface-2 text-text-secondary hover:text-text"
                  }`}
                >
                  <span class={`${s.icon} h-4 w-4`} />
                  {s.label}
                </button>
              );
            }}
          </For>
        </div>

        <div class="h-[55vh] space-y-5 overflow-y-auto pr-2 sm:h-auto">
          <Show when={section() === "global"}>
            <div class="rounded-2xl border border-border bg-surface-2 p-4">
              <h3 class="mb-3 flex items-center gap-2 font-semibold text-text">
                <span class="i-mdi-home h-4 w-4 text-primary" /> Startup tab
              </h3>
              <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <For
                each={["home", "last", ...appStore.tabs.filter((t) => t.visible).map((t) => t.id)]}
              >
                  {(id) => (
                    <button
                      onClick={() => setStartup(id as string)}
                      class={`rounded-xl px-3 py-2 text-sm font-medium transition ${
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
                      onClick={() => setClockDefault(sub)}
                      class={`rounded-xl px-3 py-2 text-sm font-medium capitalize transition ${
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
                  />
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-sm text-text-secondary">Status toast</span>
                  <Switch
                    checked={appStore.globalSettings.statusToast}
                    onChange={(v) => setGlobalSetting("statusToast", v)}
                  />
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-sm text-text-secondary">Notifications</span>
                  <Switch
                    checked={appStore.globalSettings.notifications}
                    onChange={(v) => setGlobalSetting("notifications", v)}
                  />
                </label>
              </div>
            </div>

            <div class="rounded-2xl border border-border bg-surface-2 p-4">
              <label class="mb-2 block text-sm font-medium text-text">ElevenLabs API Key</label>
              <Input type="text" value={key()} onChange={setKey} placeholder="sk_..." />
              <p class="mt-2 text-xs text-muted">Stored locally on device. Never shared.</p>
              <Button onClick={saveKey} class="mt-3 w-full">
                Save key
              </Button>
            </div>
          </Show>

          <Show when={section() === "tabs"}>
            <div class="rounded-2xl border border-border bg-surface-2 p-4">
              <h3 class="mb-3 font-semibold text-text">Visible tabs</h3>
              <div class="space-y-2">
                <For each={appStore.tabs}>
                  {(tab) => (
                    <label class="flex items-center justify-between rounded-xl bg-surface p-3">
                      <span class="text-sm font-medium text-text">{tab.label}</span>
                      <Switch checked={tab.visible} onChange={() => toggleTab(tab)} />
                    </label>
                  )}
                </For>
              </div>
            </div>
          </Show>

          <Show when={section() === "logo"}>
            <div class="rounded-2xl border border-border bg-surface-2 p-4 text-center">
              <img src="/logo.svg" alt="App logo" class="mx-auto mb-4 h-24 w-24 rounded-3xl" />
              <p class="text-sm text-text-secondary">Current logo</p>
              <p class="mt-2 text-xs text-muted">Logo customization by URL coming soon.</p>
              <Button
                onClick={() => {
                  setGlobalSetting("customLogo", "default");
                  showStatus("Logo reset to default", "success");
                }}
                class="mt-3 w-full"
              >
                Use default logo
              </Button>
            </div>
          </Show>

          <Show when={section() === "tab"}>
            <div class="rounded-2xl border border-border bg-surface-2 p-4">
              <h3 class="mb-3 font-semibold text-text">Per-tab settings</h3>
              <p class="text-sm text-text-secondary">
                Select a tab to configure. Clock sub-tabs use the Clock default setting.
              </p>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <For each={appStore.tabs.filter((t) => t.visible)}>
                {(tab) => (
                  <button
                    onClick={() => {
                      setActiveTab(tab.id);
                      props.onClose();
                      showStatus(`Open ${tab.label} settings later`, "info");
                    }}
                    class="rounded-xl bg-surface-2 px-3 py-2 text-left text-sm font-medium text-text transition hover:bg-surface-3"
                  >
                    {tab.label}
                  </button>
                )}
              </For>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}
