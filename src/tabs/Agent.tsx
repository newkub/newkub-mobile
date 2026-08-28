import { useState } from "react";
import { Sparkles, Bot, Plus } from "lucide-react";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useAppStore } from "../store/app";
import { generateTabFromPrompt } from "../lib/ai-tab";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";

export function AgentTab() {
  const [prompt, setPrompt] = useState("");
  const addTab = useAppStore((s) => s.addTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  function create() {
    if (!prompt.trim()) return;
    haptic("success");
    const tab = generateTabFromPrompt(prompt);
    addTab(tab);
    setActiveTab(tab.id);
    setPrompt("");
    showStatus(`Created tab: ${tab.label}`, "success");
  }

  return (
    <div className="flex h-full flex-col px-4">
      <div className="mb-6 rounded-2xl bg-surface-2 p-4 text-center">
        <Bot className="mx-auto mb-2 h-10 w-10 text-primary" />
        <h2 className="text-lg font-bold text-text">AI Agent</h2>
        <p className="text-sm text-text-secondary">Describe a tab and the agent will create it</p>
      </div>

      <Input
        value={prompt}
        onChange={setPrompt}
        placeholder="e.g. a task tracker, notes, email inbox..."
        className="mb-3"
      />
      <Button onClick={create} className="mb-6 w-full">
        <Sparkles className="mr-2 h-4 w-4" />
        Create tab
      </Button>

      <div className="rounded-2xl border border-border bg-surface p-3">
        <p className="mb-2 text-sm font-medium text-text">Quick ideas</p>
        <div className="flex flex-wrap gap-2">
          {["tasks", "notes", "saved links", "devin dashboard", "email drafts"].map((idea) => (
            <button
              key={idea}
              onClick={() => { haptic("light"); setPrompt(idea); }}
              className="flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:text-text"
            >
              <Plus className="h-3 w-3" />
              {idea}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
