import type { TabDefinition } from "../store/app";

export function CustomTab(props: { tab: TabDefinition }) {
  return (
    <div class="flex h-full flex-col items-center justify-center px-4 text-text-secondary">
      <div class="mb-4 rounded-3xl bg-surface-2 p-6">
        <span class="i-mdi-sparkles h-12 w-12 text-primary" />
      </div>
      <p class="text-lg font-semibold text-text">{props.tab.label}</p>
      <p class="text-center text-sm text-text-secondary">Custom tab created by AI agent.</p>
      <p class="mt-2 text-xs text-muted">ID: {props.tab.id}</p>
    </div>
  );
}
