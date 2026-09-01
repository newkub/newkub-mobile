import { createSignal, For, onMount, Show } from "solid-js";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";
import { generateUUID } from "../lib/uuid";
import { get, set } from "../lib/storage";

interface SavedItem {
  id: string;
  title: string;
  url: string;
}

const SAVED_KEY = "wrikka-mobile-saved";

export function SavedTab() {
  const [items, setItems] = createSignal<SavedItem[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [title, setTitle] = createSignal("");
  const [url, setUrl] = createSignal("");

  onMount(async () => {
    const saved = (await get<SavedItem[]>(SAVED_KEY, [])) ?? [];
    setItems(saved);
    setLoading(false);
  });

  async function persist(next: SavedItem[]) {
    setItems(next);
    try {
      await set(SAVED_KEY, next);
    } catch {
      // ignore
    }
  }

  function isValidUrl(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  async function add() {
    if (!title().trim() || !url().trim()) return;
    if (!isValidUrl(url())) {
      showStatus("Please enter a valid URL", "error");
      return;
    }
    haptic("success");
    await persist([...items(), { id: generateUUID(), title: title(), url: url() }]);
    setTitle("");
    setUrl("");
    showStatus("Saved item added", "success");
  }

  async function remove(id: string) {
    haptic("light");
    await persist(items().filter((i) => i.id !== id));
    showStatus("Removed", "info");
  }

  return (
    <div class="flex h-full flex-col px-4">
      <div class="mb-4 space-y-2">
        <Input value={title()} onChange={setTitle} placeholder="Title" />
        <div class="flex gap-2">
          <Input value={url()} onChange={setUrl} placeholder="https://..." class="flex-1" />
          <Button onClick={add} aria-label="Add saved link">
            <span class="i-mdi-plus h-5 w-5" />
          </Button>
        </div>
      </div>

      <Show when={loading()}>
        <div class="space-y-2" aria-busy="true" aria-label="Loading saved links">
          <For each={[1, 2, 3]}>
            {() => <div class="skeleton h-14 w-full" aria-busy="true" aria-label="Loading" />}
          </For>
        </div>
      </Show>

      <Show when={!loading() && items().length === 0}>
        <EmptyState
          icon="i-mdi-bookmark"
          title="No saved links yet"
          subtitle="Save your favorite links here"
        />
      </Show>

      <div class="space-y-2">
        <For each={items()}>
          {(i) => (
            <div class="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
              <span class="i-mdi-bookmark h-5 w-5 text-primary" />
              <span class="flex-1 truncate text-sm text-text">{i.title}</span>
              <a
                href={i.url}
                target="_blank"
                rel="noreferrer"
                onClick={() => haptic("light")}
                class="text-text-secondary transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:text-primary"
                aria-label="Open link"
              >
                <span class="i-mdi-open-in-new h-4 w-4" />
              </a>
              <button
                onClick={() => remove(i.id)}
                class="text-text-secondary transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:text-rose-400"
                aria-label="Remove saved link"
              >
                <span class="i-mdi-delete h-4 w-4" />
              </button>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
