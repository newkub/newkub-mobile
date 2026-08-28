import { useState } from "react";
import { Bot, MessageSquare, Sparkles, Terminal, Rocket, GitBranch, Cloud, Loader2 } from "lucide-react";
import { AiFixPanel } from "../components/AiFixPanel";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";
import { fetchWorkerStatus } from "../lib/cloudflare";
import { fetchRepoStatus } from "../lib/github";

const agents = [
  { id: "devin", name: "Devin", desc: "General coding assistant", icon: Bot },
  { id: "debugger", name: "Debugger", desc: "Find and fix bugs", icon: Terminal },
  { id: "reviewer", name: "Reviewer", desc: "Review code and UX", icon: MessageSquare },
  { id: "creative", name: "Creative", desc: "Brainstorm ideas", icon: Sparkles },
];

export function DevinTab() {
  const [opsLoading, setOpsLoading] = useState<string | null>(null);

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

  const opButton = (id: string, label: string, Icon: typeof Bot, onClick: () => void) => {
    const loading = opsLoading === id;
    return (
      <button
        key={id}
        onClick={onClick}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm font-medium text-text transition hover:bg-surface-3 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4 text-primary" />}
        {label}
      </button>
    );
  };

  return (
    <div className="flex h-full flex-col gap-4 px-4">
      <div>
        <h2 className="mb-3 text-lg font-bold text-text">AI Agents</h2>
        <div className="grid grid-cols-2 gap-3">
          {agents.map(({ id, name, desc, icon: Icon }) => (
            <button
              key={id}
              onClick={() => run(name)}
              className="flex flex-col items-start gap-2 rounded-2xl bg-surface-2 p-4 text-left transition active:scale-95"
            >
              <Icon className="h-6 w-6 text-primary" />
              <span className="font-semibold text-text">{name}</span>
              <span className="text-xs text-text-secondary">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-text">Ops</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {opButton("status", "Refresh status", Cloud, refreshStatus)}
          {opButton("deploy", "Deploy", Rocket, deploy)}
          {opButton("push", "Push to GitHub", GitBranch, push)}
        </div>
        <AiFixPanel />
      </div>
    </div>
  );
}
