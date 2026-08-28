import { createSignal, For } from "solid-js";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";
import { generateUUID } from "../lib/uuid";

interface Task {
  id: string;
  title: string;
  done: boolean;
}

export function TaskTab() {
  const [tasks, setTasks] = createSignal<Task[]>([]);
  const [value, setValue] = createSignal("");

  function add() {
    if (!value().trim()) return;
    haptic("success");
    setTasks([...tasks(), { id: generateUUID(), title: value(), done: false }]);
    setValue("");
    showStatus("Task added", "success");
  }

  function toggle(id: string) {
    haptic("light");
    setTasks(tasks().map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function remove(id: string) {
    haptic("light");
    setTasks(tasks().filter((t) => t.id !== id));
    showStatus("Task removed", "info");
  }

  return (
    <div class="flex h-full flex-col px-4">
      <div class="mb-4 flex gap-2">
        <Input value={value()} onChange={setValue} placeholder="New task..." class="flex-1" />
        <Button onClick={add}>
          <span class="i-mdi-plus h-5 w-5" />
        </Button>
      </div>
      <div class="space-y-2">
        <For each={tasks()}>
          {(t) => (
            <div class="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
              <button onClick={() => toggle(t.id)}>
                <span class={`h-5 w-5 ${t.done ? "i-mdi-check-circle text-primary" : "i-mdi-circle text-text-secondary"}`} />
              </button>
              <span class={`flex-1 text-sm ${t.done ? "text-muted line-through" : "text-text"}`}>{t.title}</span>
              <button onClick={() => remove(t.id)} class="text-text-secondary hover:text-rose-400">
                <span class="i-mdi-delete h-4 w-4" />
              </button>
            </div>
          )}
        </For>
        {tasks().length === 0 && <p class="text-center text-sm text-text-secondary">No tasks yet</p>}
      </div>
    </div>
  );
}
