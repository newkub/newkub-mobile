import { createSignal, Show } from "solid-js";
import { requestAiFix } from "../lib/devin";
import { Button } from "./Button";
import { Input } from "./Input";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";

export function AiFixPanel() {
  const [open, setOpen] = createSignal(false);
  const [query, setQuery] = createSignal("");
  const [code, setCode] = createSignal("");
  const [result, setResult] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  async function ask() {
    if (!query().trim()) return;
    haptic("light");
    setLoading(true);
    try {
      const response = await requestAiFix({
        query: query(),
        codeSnippet: code(),
      });
      setResult(response);
      haptic("success");
    } catch (err) {
      showStatus(err instanceof Error ? err.message : "AI fix failed", "error");
      haptic("error");
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    haptic("light");
    setQuery("");
    setCode("");
    setResult("");
  }

  return (
    <div class="rounded-3xl border border-border bg-surface-2 p-4">
      <button
        onClick={() => { haptic("light"); setOpen(!open()); }}
        class="flex w-full items-center justify-between text-sm font-semibold text-text transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50"
        aria-label={open() ? "Collapse AI fix panel" : "Expand AI fix panel"}
      >
        <span class="flex items-center gap-2">
          <span class="i-mdi-robot h-4 w-4 text-primary" aria-hidden="true" />
          AI Fix
        </span>
        <span class={`i-mdi-chevron-down h-4 w-4 transition ${open() ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      <Show when={open()}>
        <div class="mt-4 space-y-3">
          <Input
            value={query()}
            onChange={setQuery}
            placeholder="Describe the issue..."
            aria-label="AI fix description"
          />
          <textarea
            value={code()}
            onInput={(e) => setCode(e.currentTarget.value)}
            placeholder="Optional code snippet"
            rows={3}
            class="w-full resize-none rounded-2xl border border-border bg-surface-3 px-4 py-3 text-sm text-text outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
            aria-label="Optional code snippet"
          />
          <div class="flex gap-2">
            <Button onClick={ask} disabled={loading()} class="flex-1" aria-label="Get AI fix">
              {loading() ? (
                <span class="flex items-center gap-2">
                  <span class="i-mdi-loading h-4 w-4 animate-spin" />
                  Thinking...
                </span>
              ) : (
                <span class="flex items-center gap-2">
                  <span class="i-mdi-wand h-4 w-4" />
                  Get AI fix
                </span>
              )}
            </Button>
            <Show when={result()}>
              <Button onClick={clear} variant="secondary" class="shrink-0" aria-label="Clear result">
                <span class="i-mdi-eraser h-4 w-4" />
              </Button>
            </Show>
          </div>

          <Show when={result()}>
            <div class="max-h-48 overflow-y-auto rounded-2xl bg-surface-3 p-3 text-sm text-text">
              <p class="whitespace-pre-wrap">{result()}</p>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
}
