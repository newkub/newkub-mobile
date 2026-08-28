import { Bot, MessageSquare, Sparkles, Terminal } from "lucide-react";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";

const agents = [
  { id: "devin", name: "Devin", desc: "General coding assistant", icon: Bot },
  { id: "debugger", name: "Debugger", desc: "Find and fix bugs", icon: Terminal },
  { id: "reviewer", name: "Reviewer", desc: "Review code and UX", icon: MessageSquare },
  { id: "creative", name: "Creative", desc: "Brainstorm ideas", icon: Sparkles },
];

export function DevinTab() {
  function run(agent: string) {
    haptic("light");
    showStatus(`${agent} agent ready (mock)`, "info");
  }

  return (
    <div className="flex h-full flex-col px-4">
      <p className="mb-4 text-sm text-text-secondary">Select an AI agent to run.</p>
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
  );
}
