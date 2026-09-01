import { createSignal, Show } from "solid-js";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { addTab, setActiveTab, appStore } from "../store/app";
import { generateTabFromPrompt } from "../lib/ai-tab";
import { createDevinTabDefinition, getDevinTabResult, pollDevinSession } from "../lib/devin";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";

export function AgentTab() {
  const [prompt, setPrompt] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [status, setStatus] = createSignal("");

  const canUseDevin = () =>
    appStore.devinSettings.useProxy ||
    (appStore.devinSettings.orgId.trim() !== "" && appStore.devinSettings.apiKey.trim() !== "");

  function createLocal() {
    const tab = generateTabFromPrompt(prompt());
    addTab(tab);
    setActiveTab(tab.id);
    setPrompt("");
    haptic("success");
    showStatus(`Created tab: ${tab.label}`, "success");
  }

  async function createWithDevin() {
    haptic("light");
    setLoading(true);
    setStatus("Creating session...");

    try {
      const session = await createDevinTabDefinition(prompt());
      setStatus("Thinking...");

      await new Promise<void>((resolve, reject) => {
        const ctrl = new AbortController();
        pollDevinSession(
          session.session_id,
          {
            onSession: (s) => setStatus(`${s.status}${s.status_detail ? ` · ${s.status_detail.replace(/_/g, " ")}` : ""}`),
            onMessages: (msgs) => {
              const last = msgs[msgs.length - 1];
              if (last?.role === "assistant") setStatus(last.content.slice(0, 60));
            },
            onDone: () => resolve(),
            onError: (err) => reject(err),
          },
          ctrl.signal,
        );
      });

      const tab = await getDevinTabResult(session.session_id);
      if (tab) {
        addTab(tab);
        setActiveTab(tab.id);
        setPrompt("");
        haptic("success");
        showStatus(`Created tab: ${tab.label}`, "success");
      } else {
        showStatus("Devin did not return a valid tab, using local fallback", "warning");
        createLocal();
      }
    } catch (err) {
      showStatus(err instanceof Error ? err.message : "Devin failed, using local fallback", "warning");
      createLocal();
    } finally {
      setLoading(false);
      setStatus("");
    }
  }

  function create() {
    if (!prompt().trim()) return;
    if (canUseDevin()) {
      createWithDevin();
    } else {
      createLocal();
    }
  }

  return (
    <div class="flex h-full flex-col px-4">
      <div class="mb-6 rounded-2xl bg-surface-2 p-4 text-center">
        <span class="i-mdi-robot mx-auto mb-2 h-10 w-10 text-primary" />
        <h2 class="text-lg font-bold text-text">AI Agent</h2>
        <p class="text-sm text-text-secondary">
          {canUseDevin()
            ? "Describe a tab and Devin will design it for you"
            : "Describe a tab and the agent will create it"}
        </p>
      </div>

      <Input
        value={prompt()}
        onChange={setPrompt}
        placeholder="e.g. a task tracker, notes, email inbox..."
        class="mb-3"
      />

      <Button onClick={create} disabled={loading()} class="mb-6 w-full">
        {loading() ? (
          <span class="flex items-center gap-2">
            <span class="i-mdi-loading h-4 w-4 animate-spin" />
            {status() || "Creating..."}
          </span>
        ) : (
          <span class="flex items-center gap-2">
            <span class="i-mdi-sparkles mr-2 h-4 w-4" />
            Create tab
          </span>
        )}
      </Button>

      <Show when={!canUseDevin()}>
        <div class="mb-6 rounded-2xl border border-border bg-surface-2 p-3 text-sm text-text-secondary">
          Devin API not configured. Enable it in Settings for smarter tab design.
        </div>
      </Show>

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
