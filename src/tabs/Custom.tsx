import { EmptyState } from "../components/EmptyState";
import type { TabDefinition } from "../store/app";

export function CustomTab(props: { tab: TabDefinition }) {
  return (
    <EmptyState
      icon="i-mdi-sparkles"
      title={props.tab.label}
      subtitle="Custom tab created by AI agent."
      action={
        <p class="text-xs text-muted">ID: {props.tab.id}</p>
      }
    />
  );
}
