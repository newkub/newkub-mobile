import { createSignal, createEffect, onCleanup } from "solid-js";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";

export function NotesTab() {
  const [note, setNote] = createSignal(localStorage.getItem("newkub-mobile-note") ?? "");

  createEffect(() => {
    const value = note();
    let timeout: ReturnType<typeof setTimeout> | undefined;
    timeout = setTimeout(() => {
      localStorage.setItem("newkub-mobile-note", value);
    }, 500);
    onCleanup(() => clearTimeout(timeout));
  });

  function save() {
    haptic("success");
    localStorage.setItem("newkub-mobile-note", note());
    showStatus("Note saved", "success");
  }

  return (
    <div class="flex h-full flex-col px-4">
      <textarea
        value={note()}
        onInput={(e) => setNote(e.currentTarget.value)}
        placeholder="Write a quick note..."
        class="flex-1 w-full resize-none rounded-2xl border border-border bg-surface-2 p-4 text-sm text-text outline-none placeholder:text-muted focus:border-primary"
      />
      <button
        onClick={save}
        class="mt-3 w-full rounded-2xl bg-primary py-3 font-medium text-white transition active:scale-95"
      >
        Save note
      </button>
    </div>
  );
}
