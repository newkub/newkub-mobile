import { createSignal, createMemo, For, onMount, Show } from "solid-js";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { EmptyState } from "../../components/EmptyState";
import {
  appStore,
  addReminder,
  removeReminder,
  updateReminder,
  toggleReminder,
  type Reminder,
} from "../../store/app";
import { scheduleAlarm, cancelAlarm, requestNotificationPermission } from "../../lib/notifications";
import { haptic } from "../../lib/capacitor";
import { showStatus } from "../../lib/status";
import { hashId } from "../../lib/hash";

const repeatLabels: Record<string, string> = {
  none: "Once",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

function ReminderCard(props: {
  reminder: Reminder;
  onToggle: () => void;
  onRemove: () => void;
  onUpdate: (patch: Partial<Reminder>) => void;
}) {
  const [expanded, setExpanded] = createSignal(false);

  return (
    <div class={`rounded-3xl border bg-surface-2 p-4 transition ${props.reminder.enabled ? "border-primary/30" : "border-border"}`}>
      <div class="flex items-center gap-3">
        <div class={`rounded-2xl p-3 ${props.reminder.enabled ? "bg-primary/10 text-primary" : "bg-surface-3 text-text-secondary"}`}>
          <span class="i-mdi-bell h-6 w-6" />
        </div>
        <button
          onClick={() => setExpanded(!expanded())}
          class="flex-1 text-left transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label={expanded() ? "Collapse reminder" : "Expand reminder"}
        >
          <p class="font-semibold text-text">{props.reminder.title}</p>
          <p class="text-sm text-text-secondary">
            {new Date(`${props.reminder.date}T${props.reminder.time}`).toLocaleString("th-TH", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            · {repeatLabels[props.reminder.repeat]}
          </p>
        </button>
        <button
          onClick={props.onToggle}
          role="switch"
          aria-checked={props.reminder.enabled}
          aria-label="Toggle reminder"
          class={`h-6 w-6 rounded-full border-2 transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 ${props.reminder.enabled ? "border-primary bg-primary" : "border-text-secondary"}`}
        >
          {props.reminder.enabled && <span class="block h-3 w-3 translate-x-[3px] translate-y-[3px] rounded-full bg-white" />}
        </button>
      </div>

      <Show when={expanded()}>
        <div class="mt-4 space-y-3 border-t border-border pt-4">
          <div class="flex gap-2">
            <div class="flex-1">
              <label class="mb-1 flex items-center gap-1 text-xs text-text-secondary">
                <span class="i-mdi-calendar h-3 w-3" /> Date
              </label>
              <input
                type="date"
                value={props.reminder.date}
                onInput={(e) => props.onUpdate({ date: e.currentTarget.value })}
                class="w-full rounded-xl border border-border bg-surface-3 px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                aria-label="Reminder date"
              />
            </div>
            <div class="flex-1">
              <label class="mb-1 flex items-center gap-1 text-xs text-text-secondary">
                <span class="i-mdi-clock h-3 w-3" /> Time
              </label>
              <input
                type="time"
                value={props.reminder.time}
                onInput={(e) => props.onUpdate({ time: e.currentTarget.value })}
                class="w-full rounded-xl border border-border bg-surface-3 px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                aria-label="Reminder time"
              />
            </div>
          </div>

          <div>
            <label class="mb-1 flex items-center gap-1 text-xs text-text-secondary">
              <span class="i-mdi-repeat h-3 w-3" /> Repeat
            </label>
            <div class="flex gap-2">
              <For each={["none", "daily", "weekly", "monthly"] as const}>
                {(r) => (
                  <button
                    onClick={() => props.onUpdate({ repeat: r })}
                    class={`flex-1 rounded-xl py-2 text-xs font-medium capitalize transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                      props.reminder.repeat === r
                        ? "bg-primary text-white"
                        : "bg-surface-3 text-text-secondary"
                    }`}
                    aria-label={`Repeat ${r}`}
                  >
                    {r}
                  </button>
                )}
              </For>
            </div>
          </div>

          <Button onClick={props.onRemove} variant="danger" class="w-full" aria-label={`Delete ${props.reminder.title || "reminder"}`}>
            <span class="i-mdi-delete mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </Show>
    </div>
  );
}

function AddReminderModal(props: { onClose: () => void; onAdd: (r: Reminder) => void }) {
  const [title, setTitle] = createSignal("");
  const initialDate = (() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  })();
  const [date, setDate] = createSignal(initialDate);
  const [time, setTime] = createSignal("09:00");
  const [repeat, setRepeat] = createSignal<Reminder["repeat"]>("none");

  function save() {
    props.onAdd({
      id: `r_${Date.now()}`,
      title: title() || "Reminder",
      date: date(),
      time: time(),
      repeat: repeat(),
      enabled: true,
      createdAt: Date.now(),
    });
    props.onClose();
  }

  return (
    <div class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4">
      <div class="w-full max-w-md rounded-3xl bg-surface p-6">
        <h2 class="mb-4 flex items-center gap-2 text-xl font-bold">
          <span class="i-mdi-bell h-6 w-6 text-primary" /> New Reminder
        </h2>
        <Input value={title()} onChange={setTitle} placeholder="What to remember?" class="mb-3" />
        <div class="mb-3 flex gap-2">
          <Input type="date" value={date()} onChange={setDate} aria-label="Date" />
          <Input type="time" value={time()} onChange={setTime} aria-label="Time" />
        </div>
        <div class="mb-5">
          <label class="mb-2 block text-sm text-text-secondary">Repeat</label>
          <div class="flex gap-2">
            <For each={["none", "daily", "weekly", "monthly"] as const}>
              {(r) => (
                <button
                  onClick={() => setRepeat(r)}
                  class={`flex-1 rounded-xl py-2 text-xs font-medium capitalize transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    repeat() === r ? "bg-primary text-white" : "bg-surface-3 text-text-secondary"
                  }`}
                  aria-label={`Repeat ${r}`}
                >
                  {r}
                </button>
              )}
            </For>
          </div>
        </div>
        <div class="flex gap-3">
          <Button onClick={props.onClose} variant="secondary" class="flex-1" aria-label="Cancel">Cancel</Button>
          <Button onClick={save} class="flex-1" aria-label="Save reminder">Save</Button>
        </div>
      </div>
    </div>
  );
}

export function ReminderTab() {
  const [isAdding, setIsAdding] = createSignal(false);
  const [now, setNow] = createSignal(new Date());

  onMount(() => {
    requestNotificationPermission();

    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  });

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const title = params.get("title");
    const date = params.get("date");
    const time = params.get("time");
    if (title && date && time) {
      addReminder({
        id: `r_${Date.now()}`,
        title,
        date,
        time,
        repeat: "none",
        enabled: true,
        createdAt: Date.now(),
      });
      window.history.replaceState({}, "", window.location.pathname);
      haptic("success");
    }
  });

  const sorted = createMemo(() =>
    [...appStore.reminders].sort(
      (a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
    )
  );
  const future = createMemo(() =>
    sorted().filter((r) => new Date(`${r.date}T${r.time}`) >= now())
  );
  const past = createMemo(() =>
    sorted().filter((r) => new Date(`${r.date}T${r.time}`) < now())
  );

  async function handleToggle(r: Reminder) {
    const enabled = !r.enabled;
    toggleReminder(r.id);
    if (enabled) {
      const at = new Date(`${r.date}T${r.time}`);
      await scheduleAlarm({
        id: hashId(r.id),
        title: r.title,
        body: "Reminder",
        schedule: { at },
      });
      haptic("success");
    } else {
      await cancelAlarm(hashId(r.id));
      haptic("light");
    }
  }

  function handleRemove(r: Reminder) {
    removeReminder(r.id);
    haptic("light");
    showStatus("Reminder removed", "info");
  }

  return (
    <div class="tab-content flex h-full flex-col gap-4 overflow-y-auto p-5 pb-28">
      <div class="rounded-2xl border border-dashed border-border bg-surface-2/50 p-4">
        <h3 class="text-sm font-semibold text-text-secondary">Add from notification panel</h3>
        <p class="mt-1 text-xs text-muted">
          Share to app with <code>?title=&amp;date=&amp;time=</code> query
        </p>
      </div>

      <Show when={future().length === 0}>
        <EmptyState
          icon="i-mdi-bell"
          title="No upcoming reminders"
          subtitle="Add a reminder to get started"
        />
      </Show>

      <For each={future()}>
        {(r) => (
          <ReminderCard
            reminder={r}
            onToggle={() => handleToggle(r)}
            onRemove={() => handleRemove(r)}
            onUpdate={(patch) => updateReminder(r.id, patch)}
          />
        )}
      </For>

      <Show when={past().length > 0}>
        <h3 class="text-sm font-semibold text-text-secondary">Past</h3>
        <For each={past()}>
          {(r) => (
            <ReminderCard
              reminder={r}
              onToggle={() => handleToggle(r)}
              onRemove={() => handleRemove(r)}
              onUpdate={(patch) => updateReminder(r.id, patch)}
            />
          )}
        </For>
      </Show>

      <Button onClick={() => setIsAdding(true)} class="mt-2 w-full" size="lg" aria-label="New reminder">
        <span class="i-mdi-plus mr-2 h-5 w-5" /> New Reminder
      </Button>

      <Show when={isAdding()}>
        <AddReminderModal
          onClose={() => setIsAdding(false)}
          onAdd={(r) => {
            addReminder(r);
            if (r.enabled) {
              const at = new Date(`${r.date}T${r.time}`);
              scheduleAlarm({ id: hashId(r.id), title: r.title, body: "Reminder", schedule: { at } });
            }
            haptic("success");
          }}
        />
      </Show>
    </div>
  );
}
