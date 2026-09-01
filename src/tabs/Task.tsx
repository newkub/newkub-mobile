import { createSignal, For, onMount, Show } from "solid-js";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";
import { generateUUID } from "../lib/uuid";
import { get, set } from "../lib/storage";

interface Task {
  id: string;
  title: string;
  done: boolean;
}

const TASKS_KEY = "wrikka-mobile-tasks";

export function TaskTab() {
  const [tasks, setTasks] = createSignal<Task[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [value, setValue] = createSignal("");

  onMount(async () => {
    const saved = (await get<Task[]>(TASKS_KEY, [])) ?? [];
    setTasks(saved);
    setLoading(false);
  });

  async function persist(next: Task[]) {
    setTasks(next);
    try {
      await set(TASKS_KEY, next);
    } catch {
      // ignore storage failures
    }
  }

  async function add() {
    if (!value().trim()) return;
    haptic("success");
    await persist([...tasks(), { id: generateUUID(), title: value(), done: false }]);
    setValue("");
    showStatus("Task added", "success");
  }

  async function toggle(id: string) {
    haptic("light");
    await persist(tasks().map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  async function remove(id: string) {
    haptic("light");
    await persist(tasks().filter((t) => t.id !== id));
    showStatus("Task removed", "info");
  }

  return (
    <div class="flex h-full flex-col px-4">
      <div class="mb-4 flex gap-2">
        <Input value={value()} onChange={setValue} placeholder="New task..." class="flex-1" />
        <Button onClick={add} aria-label="Add task">
          <span class="i-mdi-plus h-5 w-5" />
        </Button>
      </div>

      <Show when={!loading() && tasks().length === 0}>
        <EmptyState
          icon="i-mdi-check-circle"
          title="No tasks yet"
          subtitle="Add a task to get started"
        />
      </Show>

      <Show when={loading()}>
        <div class="space-y-2" aria-busy="true" aria-label="Loading tasks">
          <For each={[1, 2, 3]}>
            {() => <div class="skeleton h-14 w-full" aria-busy="true" aria-label="Loading" />}
          </For>
        </div>
      </Show>

      <div class="space-y-2">
        <For each={tasks()}>
          {(t) => (
            <div class="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
              <button
                onClick={() => toggle(t.id)}
                class="transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label={t.done ? "Mark task as not done" : "Mark task as done"}
              >
                <span class={`h-5 w-5 ${t.done ? "i-mdi-check-circle text-primary" : "i-mdi-circle text-text-secondary"}`} />
              </button>
              <span class={`flex-1 text-sm ${t.done ? "text-muted line-through" : "text-text"}`}>{t.title}</span>
              <button
                onClick={() => remove(t.id)}
                class="text-text-secondary transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:text-rose-400"
                aria-label="Delete task"
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
