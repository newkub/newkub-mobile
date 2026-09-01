import { createSignal } from "solid-js";
import { createDevinSession } from "../../lib/devin";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { haptic } from "../../lib/capacitor";
import { showStatus } from "../../lib/status";
import type { DevinSession } from "../../types";

const MODES = ["normal", "fast", "lite"];

export function DevinNewSession(props: {
  onCreated: (session: DevinSession) => void;
  onCancel: () => void;
}) {
  const [prompt, setPrompt] = createSignal("");
  const [mode, setMode] = createSignal("normal");
  const [loading, setLoading] = createSignal(false);

  async function start() {
    const text = prompt().trim();
    if (!text) {
      showStatus("Enter a prompt first", "warning");
      return;
    }
    haptic("light");
    setLoading(true);
    try {
      const session = await createDevinSession(text, { devin_mode: mode() });
      showStatus("Session created", "success");
      props.onCreated(session);
    } catch (err) {
      showStatus(err instanceof Error ? err.message : "Failed to create session", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="flex h-full flex-col gap-4 px-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-text">New Devin Session</h2>
        <button
          onClick={props.onCancel}
          class="rounded-full p-2 text-text-secondary transition hover:text-text"
          aria-label="Cancel"
        >
          <span class="i-mdi-close h-5 w-5" />
        </button>
      </div>

      <Input
        value={prompt()}
        onChange={setPrompt}
        label="Prompt"
        placeholder="e.g. Fix the alarm notification bug..."
      />

      <div>
        <label class="mb-2 block text-sm font-medium text-text">Mode</label>
        <div class="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              onClick={() => { haptic("light"); setMode(m); }}
              class={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                mode() === m
                  ? "bg-primary text-white"
                  : "bg-surface-2 text-text-secondary hover:text-text"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div class="mt-auto">
        <Button onClick={start} disabled={loading()} class="w-full">
          {loading() ? (
            <span class="flex items-center gap-2">
              <span class="i-mdi-loading h-4 w-4 animate-spin" />
              Creating...
            </span>
          ) : (
            <span class="flex items-center gap-2">
              <span class="i-mdi-send h-4 w-4" />
              Start session
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
