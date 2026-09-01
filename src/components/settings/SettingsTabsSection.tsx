import { For } from "solid-js";
import { appStore, updateTab, type TabDefinition } from "../../store/app";
import { Switch } from "../Switch";
import { haptic } from "../../lib/capacitor";
import { showStatus } from "../../lib/status";

export function SettingsTabsSection() {
  function toggleTab(tab: TabDefinition) {
    if (["home", "clock"].includes(tab.id)) {
      showStatus("Home and Clock tabs cannot be hidden", "warning");
      return;
    }
    updateTab(tab.id, { visible: !tab.visible });
    haptic(tab.visible ? "light" : "success");
  }

  return (
    <div class="rounded-2xl border border-border bg-surface-2 p-4">
      <h3 class="mb-3 font-semibold text-text">Visible tabs</h3>
      <div class="space-y-2">
        <For each={appStore.tabs}>
          {(tab) => (
            <label class="flex items-center justify-between rounded-xl bg-surface p-3">
              <span class="text-sm font-medium text-text">{tab.label}</span>
              <Switch checked={tab.visible} onChange={() => toggleTab(tab)} aria-label={`Show ${tab.label} tab`} />
            </label>
          )}
        </For>
      </div>
    </div>
  );
}
