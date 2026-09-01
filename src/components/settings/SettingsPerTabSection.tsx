import { For } from "solid-js";
import { appStore, setActiveTab } from "../../store/app";
import { showStatus } from "../../lib/status";

type SettingsPerTabSectionProps = {
  onClose: () => void;
};

export function SettingsPerTabSection(props: SettingsPerTabSectionProps) {
  return (
    <>
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
              class="rounded-xl bg-surface-2 px-3 py-2 text-left text-sm font-medium text-text transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:bg-surface-3"
            >
              {tab.label}
            </button>
          )}
        </For>
      </div>
    </>
  );
}
