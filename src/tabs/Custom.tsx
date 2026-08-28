import { Sparkles } from "lucide-react";
import type { TabDefinition } from "../store/app";

export function CustomTab({ tab }: { tab: TabDefinition }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-text-secondary">
      <div className="mb-4 rounded-3xl bg-surface-2 p-6">
        <Sparkles className="h-12 w-12 text-primary" />
      </div>
      <p className="text-lg font-semibold text-text">{tab.label}</p>
      <p className="text-center text-sm text-text-secondary">Custom tab created by AI agent.</p>
      <p className="mt-2 text-xs text-muted">ID: {tab.id}</p>
    </div>
  );
}
