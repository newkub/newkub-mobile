import { createSignal, For } from "solid-js";
import { AiFixPanel } from "../components/AiFixPanel";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";
import { fetchWorkerStatus } from "../lib/cloudflare";
import { fetchRepoStatus } from "../lib/github";

const agents = [
  { id: "devin", name: "Devin", desc: "General coding assistant", icon: "i-mdi-robot" },
  { id: "debugger", name: "Debugger", desc: "Find and fix bugs", icon: "i-mdi-console" },
  { id: "reviewer", name: "Reviewer", desc: "Review code and UX", icon: "i-mdi-message-text" },
  { id: "creative", name: "Creative", desc: "Brainstorm ideas", icon: "i-mdi-sparkles" },
];

export function DevinTab() {
  const [opsLoading, setOpsLoading] = createSignal<string | null>(null);

  function run(agent: string) {
    haptic("light");
    showStatus(`${agent} agent ready (mock)`, "info");
  }

  async function refreshStatus() {
    haptic("light");
    setOpsLoading("status");
    try {
      const [repo, worker] = await Promise.all([fetchRepoStatus(), fetchWorkerStatus()]);
      showStatus(`Repo: ${repo.name}, Worker: ${worker.status}`, worker.status === "healthy" ? "success" : "warning");
    } catch (err) {
      showStatus(err instanceof Error ? err.message : "Status refresh failed", "error");
    } finally {
      setOpsLoading(null);
    }
  }

  async function deploy() {
    haptic("light");
    setOpsLoading("deploy");
    try {
      const res = await fetch("/api/deploy", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        showStatus(data.message ?? "Deploy triggered", "success");
      } else {
        showStatus(data.error ?? "Deploy not configured", "warning");
      }
    } catch (err) {
      showStatus(err instanceof Error ? err.message : "Deploy failed", "error");
    } finally {
      setOpsLoading(null);
    }
  }

  async function push() {
    haptic("light");
    setOpsLoading("push");
    try {
      const res = await fetch("/api/push", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        showStatus(data.message ?? "Push triggered", "success");
      } else {
        showStatus(data.error ?? "Push not configured", "warning");
      }
    } catch (err) {
      showStatus(err instanceof Error ? err.message : "Push failed", "error");
    } finally {
      setOpsLoading(null);
    }
  }

  function opButton(id: string, label: string, icon: string, onClick: () => void) {
    const loading = opsLoading() === id;
    return (
      <button
        onClick={onClick}
        disabled={loading}
        class="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm font-medium text-text transition hover:bg-surface-3 disabled:opacity-50"
      >
        {loading ? (
          <span class="i-mdi-loading h-4 w-4 animate-spin" />
        ) : (
          <span class={`${icon} h-4 w-4 text-primary`} />
        )}
        {label}
      </button>
    );
  }

  return (
    <div class="flex h-full flex-col gap-4 px-4">
      <div>
        <h2 class="mb-3 text-lg font-bold text-text">AI Agents</h2>
        <div class="grid grid-cols-2 gap-3">
          <For each={agents}>
            {({ name, desc, icon }) => (
              <button
                onClick={() => run(name)}
                class="flex flex-col items-start gap-2 rounded-2xl bg-surface-2 p-4 text-left transition active:scale-95"
              >
                <span class={`${icon} h-6 w-6 text-primary`} />
                <span class="font-semibold text-text">{name}</span>
                <span class="text-xs text-text-secondary">{desc}</span>
              </button>
            )}
          </For>
        </div>
      </div>

      <div>
        <h2 class="mb-3 text-lg font-bold text-text">Ops</h2>
        <div class="mb-4 flex flex-wrap gap-2">
          {opButton("status", "Refresh status", "i-mdi-cloud", refreshStatus)}
          {opButton("deploy", "Deploy", "i-mdi-rocket", deploy)}
          {opButton("push", "Push to GitHub", "i-mdi-source-branch", push)}
        </div>
        <AiFixPanel />
      </div>
    </div>
  );
}
