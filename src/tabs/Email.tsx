import { createSignal, For, onMount, Show } from "solid-js";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";
import { generateUUID } from "../lib/uuid";
import { get, set } from "../lib/storage";

interface Draft {
  id: string;
  to: string;
  subject: string;
  body: string;
}

const DRAFTS_KEY = "wrikka-mobile-drafts";

export function EmailTab() {
  const [drafts, setDrafts] = createSignal<Draft[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [to, setTo] = createSignal("");
  const [subject, setSubject] = createSignal("");
  const [body, setBody] = createSignal("");

  onMount(async () => {
    const saved = (await get<Draft[]>(DRAFTS_KEY, [])) ?? [];
    setDrafts(saved);
    setLoading(false);
  });

  async function persist(next: Draft[]) {
    setDrafts(next);
    try {
      await set(DRAFTS_KEY, next);
    } catch {
      // ignore
    }
  }

  async function send() {
    if (!to().trim() || !subject().trim()) {
      showStatus("To and subject are required", "warning");
      return;
    }
    haptic("success");
    const draft: Draft = { id: generateUUID(), to: to(), subject: subject(), body: body() };
    await persist([draft, ...drafts()]);
    setTo("");
    setSubject("");
    setBody("");
    showStatus("Email draft saved", "success");
  }

  async function remove(id: string) {
    haptic("light");
    await persist(drafts().filter((d) => d.id !== id));
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
          class="h-24 w-full resize-none rounded-2xl border border-border bg-surface-2 p-3 text-sm text-text outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
          aria-label="Email body"
        />
        <Button onClick={send} class="w-full" aria-label="Save email draft">
          <span class="i-mdi-send mr-2 h-4 w-4" />
          Save draft
        </Button>
      </div>

      <Show when={loading()}>
        <div class="space-y-2" aria-busy="true" aria-label="Loading drafts">
          <For each={[1, 2, 3]}>
            {() => <div class="skeleton h-20 w-full" aria-busy="true" aria-label="Loading" />}
          </For>
        </div>
      </Show>

      <Show when={!loading() && drafts().length === 0}>
        <EmptyState
          icon="i-mdi-email"
          title="No drafts yet"
          subtitle="Create an email draft to save it here"
        />
      </Show>

      <div class="space-y-2 overflow-y-auto">
        <For each={drafts()}>
          {(d) => (
            <div class="rounded-2xl bg-surface-2 p-3">
              <div class="mb-1 flex items-center justify-between">
                <span class="text-sm font-semibold text-text">{d.subject}</span>
                <button
                  onClick={() => remove(d.id)}
                  class="text-text-secondary transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:text-rose-400"
                  aria-label="Delete draft"
                >
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
