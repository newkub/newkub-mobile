import { createSignal, createEffect, onCleanup, onMount, Show } from "solid-js";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";
import { get, set } from "../lib/storage";
import { Button } from "../components/Button";

const NOTE_KEY = "wrikka-mobile-note";

export function NotesTab() {
  const [note, setNote] = createSignal("");
  const [loading, setLoading] = createSignal(true);
  const [savedAt, setSavedAt] = createSignal<string | null>(null);

  onMount(async () => {
    const saved = (await get<string>(NOTE_KEY, "")) ?? "";
    setNote(saved);
    setLoading(false);
  });

  createEffect(() => {
    const value = note();
    let timeout: ReturnType<typeof setTimeout> | undefined;
    timeout = setTimeout(async () => {
      try {
        await set(NOTE_KEY, value);
      } catch {
        // ignore
      }
    }, 500);
    onCleanup(() => clearTimeout(timeout));
  });

  async function save() {
    haptic("success");
    try {
      await set(NOTE_KEY, note());
      setSavedAt(new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }));
      showStatus("Note saved", "success");
    } catch {
      showStatus("Failed to save note", "error");
    }
  }

  return (
    <div class="flex h-full flex-col px-4">
      <Show when={loading()}>
        <div class="skeleton h-full w-full" aria-busy="true" aria-label="Loading note" />
      </Show>

      <Show when={!loading()}>
        <textarea
          value={note()}
          onInput={(e) => setNote(e.currentTarget.value)}
          placeholder="Write a quick note..."
          class="flex-1 w-full resize-none rounded-2xl border border-border bg-surface-2 p-4 text-sm text-text outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
          aria-label="Quick note"
        />

        <div class="mt-3 flex items-center justify-between">
          <Show when={savedAt()}>
            <span class="text-xs text-text-secondary">Saved at {savedAt()}</span>
          </Show>
          <Show when={!savedAt()}>
            <span class="text-xs text-text-secondary">Auto-saves while typing</span>
          </Show>
          <Button onClick={save} aria-label="Save note">
            <span class="i-mdi-content-save mr-2 h-4 w-4" />
            Save note
          </Button>
        </div>
      </Show>
    </div>
  );
}
