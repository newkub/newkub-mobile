import { createSignal, Show } from "solid-js";
import { Input } from "./Input";
import { Button } from "./Button";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";

export function AiFixPanel() {
  const [error, setError] = createSignal("");
  const [code, setCode] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [result, setResult] = createSignal<string | null>(null);

  async function fix() {
    if (!error().trim()) return;
    haptic("light");
    setLoading(true);
    try {
      const res = await fetch("/api/ai-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: error(), code: code() }),
      });
      const data = await res.json();
      if (data.ok) {
        setResult(data.suggestion);
        showStatus("AI Fix suggestion ready", "success");
      } else {
        showStatus(data.error ?? "AI Fix failed", "error");
      }
    } catch (err) {
      showStatus(err instanceof Error ? err.message : "AI Fix failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="rounded-2xl border border-border bg-surface-2 p-4">
      <h3 class="mb-3 flex items-center gap-2 font-semibold text-text">
        <span class="i-mdi-wand h-4 w-4 text-primary" /> AI Fix
      </h3>
      <p class="mb-3 text-sm text-text-secondary">Paste an error or describe a problem to get a fix suggestion.</p>
      <Input value={error()} onChange={setError} placeholder="Error message or stack trace" class="mb-2" />
      <textarea
        value={code()}
        onInput={(e) => setCode(e.currentTarget.value)}
        placeholder="Optional code snippet"
        class="mb-3 h-24 w-full resize-none rounded-2xl border border-border bg-surface p-3 text-sm text-text outline-none placeholder:text-muted focus:border-primary"
      />
      <Button onClick={fix} disabled={loading()} class="w-full">
        {loading() ? (
          <span class="i-mdi-loading mr-2 h-4 w-4 animate-spin" />
        ) : (
          <span class="i-mdi-wand mr-2 h-4 w-4" />
        )}
        {loading() ? "Analyzing..." : "Get AI Fix"}
      </Button>

      <Show when={result()}>
        <div class="mt-3 rounded-xl bg-surface p-3 text-sm text-text">
          <pre class="whitespace-pre-wrap font-mono text-xs leading-relaxed">{result()}</pre>
          <button onClick={() => setResult(null)} class="mt-2 text-xs text-text-secondary hover:text-text">
            <span class="i-mdi-close-circle mr-1 inline h-3 w-3" /> Clear
          </button>
        </div>
      </Show>
    </div>
  );
}
