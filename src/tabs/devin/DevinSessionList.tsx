import { createSignal, For, onMount, Show } from "solid-js";
import { listDevinSessions } from "../../lib/devin";
import type { DevinSession } from "../../types";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { haptic } from "../../lib/capacitor";
import { showStatus } from "../../lib/status";

export function DevinSessionList(props: {
  onNew: () => void;
  onSelect: (session: DevinSession) => void;
}) {
  const [sessions, setSessions] = createSignal<DevinSession[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [search, setSearch] = createSignal("");

  async function load() {
    setLoading(true);
    try {
      const { sessions: list } = await listDevinSessions(50);
      setSessions(list);
    } catch (err) {
      showStatus(err instanceof Error ? err.message : "Failed to load sessions", "error");
    } finally {
      setLoading(false);
    }
  }

  onMount(load);

  const filtered = () =>
    sessions().filter((s) =>
      (s.title || s.session_id).toLowerCase().includes(search().toLowerCase())
    );

  function statusLabel(s: DevinSession) {
    if (s.is_archived) return "archived";
    if (s.status_detail) return s.status_detail.replace(/_/g, " ");
    return s.status;
  }

  return (
    <div class="flex h-full flex-col gap-4 px-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-text">Devin Sessions</h2>
        <button
          onClick={() => { haptic("light"); props.onNew(); }}
          class="rounded-full bg-primary p-2 text-white transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label="New session"
        >
          <span class="i-mdi-plus h-5 w-5" />
        </button>
      </div>

      <Input
        value={search()}
        onChange={setSearch}
        placeholder="Search sessions..."
      />

      <Show when={!loading() && filtered().length === 0}>
        <EmptyState
          icon="i-mdi-robot"
          title="No sessions yet"
          subtitle="Start a new Devin session"
          action={
            <Button onClick={() => { haptic("success"); props.onNew(); }} size="sm" aria-label="New session">
              New session
            </Button>
          }
        />
      </Show>

      <Show when={loading()}>
        <div class="space-y-3" aria-busy="true" aria-label="Loading sessions">
          <For each={[1, 2, 3]}>
            {() => (
              <div class="skeleton h-20 w-full" aria-busy="true" aria-label="Loading" />
            )}
          </For>
        </div>
      </Show>

      <div class="space-y-2 overflow-y-auto pb-4">
        <For each={filtered()}>
          {(session) => (
            <button
              onClick={() => { haptic("light"); props.onSelect(session); }}
              class="w-full rounded-2xl bg-surface-2 p-4 text-left transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label={`Open session ${session.title || session.session_id}`}
            >
              <div class="flex items-start justify-between gap-2">
                <span class="truncate font-semibold text-text">
                  {session.title || session.session_id}
                </span>
                <span
                  class={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                    session.status === "running"
                      ? "bg-primary/20 text-primary"
                      : session.status === "error"
                      ? "bg-danger/20 text-danger"
                      : "bg-surface-3 text-text-secondary"
                  }`}
                >
                  {statusLabel(session)}
                </span>
              </div>
              <p class="mt-1 text-xs text-text-secondary">{session.session_id}</p>
            </button>
          )}
        </For>
      </div>
    </div>
  );
}
