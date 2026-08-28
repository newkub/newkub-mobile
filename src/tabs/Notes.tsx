import { useState, useEffect } from "react";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";

export function NotesTab() {
  const [note, setNote] = useState(localStorage.getItem("newkub-mobile-note") ?? "");

  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem("newkub-mobile-note", note);
    }, 500);
    return () => clearTimeout(t);
  }, [note]);

  function save() {
    haptic("success");
    localStorage.setItem("newkub-mobile-note", note);
    showStatus("Note saved", "success");
  }

  return (
    <div className="flex h-full flex-col px-4">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write a quick note..."
        className="flex-1 w-full resize-none rounded-2xl border border-border bg-surface-2 p-4 text-sm text-text outline-none placeholder:text-muted focus:border-primary"
      />
      <button
        onClick={save}
        className="mt-3 w-full rounded-2xl bg-primary py-3 font-medium text-white transition active:scale-95"
      >
        Save note
      </button>
    </div>
  );
}
