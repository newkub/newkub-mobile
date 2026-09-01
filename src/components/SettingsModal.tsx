import { createSignal, For, Show } from "solid-js";
import {
  appStore,
  setGlobalSetting,
  setClockSubTab,
  setElevenLabsKey,
  setDevinSettings,
} from "../store/app";
import { showStatus } from "../lib/status";
import { SettingsGlobalSection } from "./settings/SettingsGlobalSection";
import { SettingsTabsSection } from "./settings/SettingsTabsSection";
import { SettingsLogoSection } from "./settings/SettingsLogoSection";
import { SettingsPerTabSection } from "./settings/SettingsPerTabSection";
import { SettingsDevinSection } from "./settings/SettingsDevinSection";

type Section = "global" | "tabs" | "logo" | "tab" | "devin";

const sections: { id: Section; label: string; icon: string }[] = [
  { id: "global", label: "Global", icon: "i-mdi-tune" },
  { id: "tabs", label: "Tabs", icon: "i-mdi-home" },
  { id: "logo", label: "Logo", icon: "i-mdi-image" },
  { id: "tab", label: "Per-Tab", icon: "i-mdi-clock" },
  { id: "devin", label: "Devin", icon: "i-mdi-robot" },
];

export function SettingsModal(props: { onClose: () => void }) {
  const [section, setSection] = createSignal<Section>("global");
  const [key, setKey] = createSignal(appStore.elevenLabsKey);
  const [devinOrg, setDevinOrg] = createSignal(appStore.devinSettings.orgId);
  const [devinKey, setDevinKey] = createSignal(appStore.devinSettings.apiKey);
  const [devinProxy, setDevinProxy] = createSignal(appStore.devinSettings.useProxy);
  const [devinNotifyDone, setDevinNotifyDone] = createSignal(appStore.devinSettings.notifyCompleted);
  const [devinNotifyWait, setDevinNotifyWait] = createSignal(appStore.devinSettings.notifyWaiting);

  function saveKey() {
    setElevenLabsKey(key());
    showStatus("ElevenLabs key saved", "success");
  }

  function saveDevin() {
    setDevinSettings({
      orgId: devinOrg().trim(),
      apiKey: devinKey().trim(),
      useProxy: devinProxy(),
      notifyCompleted: devinNotifyDone(),
      notifyWaiting: devinNotifyWait(),
    });
    showStatus("Devin settings saved", "success");
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
          <button
            onClick={props.onClose}
            class="rounded-full p-2 text-text-secondary transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:text-text"
            aria-label="Close settings"
          >
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
                  class={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
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
            <SettingsGlobalSection
              elevenLabsKey={key()}
              setElevenLabsKey={setKey}
              saveKey={saveKey}
              setStartup={setStartup}
              setClockDefault={setClockDefault}
            />
          </Show>
          <Show when={section() === "tabs"}>
            <SettingsTabsSection />
          </Show>
          <Show when={section() === "logo"}>
            <SettingsLogoSection />
          </Show>
          <Show when={section() === "tab"}>
            <SettingsPerTabSection onClose={props.onClose} />
          </Show>
          <Show when={section() === "devin"}>
            <SettingsDevinSection
              org={devinOrg()}
              setOrg={setDevinOrg}
              key={devinKey()}
              setKey={setDevinKey}
              useProxy={devinProxy()}
              setUseProxy={setDevinProxy}
              notifyDone={devinNotifyDone()}
              setNotifyDone={setDevinNotifyDone}
              notifyWait={devinNotifyWait()}
              setNotifyWait={setDevinNotifyWait}
              save={saveDevin}
            />
          </Show>
        </div>
      </div>
    </div>
  );
}
