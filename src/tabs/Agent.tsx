import { createSignal } from "solid-js";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { addTab, setActiveTab } from "../store/app";
import { generateTabFromPrompt } from "../lib/ai-tab";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";

export function AgentTab() {
  const [prompt, setPrompt] = createSignal("");

  function create() {
    if (!prompt().trim()) return;
    haptic("success");
    const tab = generateTabFromPrompt(prompt());
    addTab(tab);
    setActiveTab(tab.id);
    setPrompt("");
    showStatus(`Created tab: ${tab.label}`, "success");
  }

  return (
    <div class="flex h-full flex-col px-4">
      <div class="mb-6 rounded-2xl bg-surface-2 p-4 text-center">
        <span class="i-mdi-robot mx-auto mb-2 h-10 w-10 text-primary" />
        <h2 class="text-lg font-bold text-text">AI Agent</h2>
        <p class="text-sm text-text-secondary">Describe a tab and the agent will create it</p>
      </div>

      <Input
        value={prompt()}
        onChange={setPrompt}
        placeholder="e.g. a task tracker, notes, email inbox..."
        class="mb-3"
      />
      <Button onClick={create} class="mb-6 w-full">
        <span class="i-mdi-sparkles mr-2 h-4 w-4" />
        Create tab
      </Button>

      <div class="rounded-2xl border border-border bg-surface p-3">
        <p class="mb-2 text-sm font-medium text-text">Quick ideas</p>
        <div class="flex flex-wrap gap-2">
          {["tasks", "notes", "saved links", "devin dashboard", "email drafts"].map((idea) => (
            <button
              onClick={() => { haptic("light"); setPrompt(idea); }}
              class="flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:text-text"
            >
              <span class="i-mdi-plus h-3 w-3" />
              {idea}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
