import { createSignal, For } from "solid-js";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";
import { generateUUID } from "../lib/uuid";

interface Draft {
  id: string;
  to: string;
  subject: string;
  body: string;
}

export function EmailTab() {
  const [drafts, setDrafts] = createSignal<Draft[]>([]);
  const [to, setTo] = createSignal("");
  const [subject, setSubject] = createSignal("");
  const [body, setBody] = createSignal("");

  function send() {
    if (!to().trim() || !subject().trim()) return;
    haptic("success");
    const draft: Draft = { id: generateUUID(), to: to(), subject: subject(), body: body() };
    setDrafts([draft, ...drafts()]);
    setTo("");
    setSubject("");
    setBody("");
    showStatus("Email draft saved", "success");
  }

  function remove(id: string) {
    haptic("light");
    setDrafts(drafts().filter((d) => d.id !== id));
    showStatus("Draft removed", "info");
  }

  return (
    <div class="flex h-full flex-col px-4">
      <div class="mb-4 space-y-2">
        <Input value={to()} onChange={setTo} placeholder="To" />
        <Input value={subject()} onChange={setSubject} placeholder="Subject" />
        <textarea
          value={body()}
          onInput={(e) => setBody(e.currentTarget.value)}
          placeholder="Message"
          class="h-24 w-full resize-none rounded-2xl border border-border bg-surface-2 p-3 text-sm text-text outline-none placeholder:text-muted focus:border-primary"
        />
        <Button onClick={send} class="w-full">
          <span class="i-mdi-send mr-2 h-4 w-4" />
          Save draft
        </Button>
      </div>
      <div class="space-y-2">
        {drafts().length === 0 && (
          <p class="text-center text-sm text-text-secondary">
            <span class="i-mdi-email mx-auto mb-1 h-5 w-5" /> No drafts yet
          </p>
        )}
        <For each={drafts()}>
          {(d) => (
            <div class="rounded-2xl bg-surface-2 p-3">
              <div class="mb-1 flex items-center justify-between">
                <span class="text-sm font-semibold text-text">{d.subject}</span>
                <button onClick={() => remove(d.id)} class="text-text-secondary hover:text-rose-400">
                  <span class="i-mdi-delete h-4 w-4" />
                </button>
              </div>
              <p class="text-xs text-text-secondary">To: {d.to}</p>
              <p class="mt-1 text-xs text-muted line-clamp-2">{d.body}</p>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
