import { useState } from "react";
import { Plus, CheckCircle2, Trash2 } from "lucide-react";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";

interface Task {
  id: string;
  title: string;
  done: boolean;
}

export function TaskTab() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [value, setValue] = useState("");

  function add() {
    if (!value.trim()) return;
    haptic("success");
    setTasks([...tasks, { id: crypto.randomUUID(), title: value, done: false }]);
    setValue("");
    showStatus("Task added", "success");
  }

  function toggle(id: string) {
    haptic("light");
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function remove(id: string) {
    haptic("light");
    setTasks(tasks.filter((t) => t.id !== id));
    showStatus("Task removed", "info");
  }

  return (
    <div className="flex h-full flex-col px-4">
      <div className="mb-4 flex gap-2">
        <Input value={value} onChange={setValue} placeholder="New task..." className="flex-1" />
        <Button onClick={add}>
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      <div className="space-y-2">
        {tasks.length === 0 && <p className="text-center text-sm text-text-secondary">No tasks yet</p>}
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
            <button onClick={() => toggle(t.id)}>
              <CheckCircle2 className={`h-5 w-5 ${t.done ? "text-primary" : "text-text-secondary"}`} />
            </button>
            <span className={`flex-1 text-sm ${t.done ? "text-muted line-through" : "text-text"}`}>{t.title}</span>
            <button onClick={() => remove(t.id)} className="text-text-secondary hover:text-rose-400">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
