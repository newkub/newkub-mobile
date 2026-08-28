import { useState, useEffect } from "react";
import { Plus, Bell, Calendar, Clock, Trash2, Repeat } from "lucide-react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useAppStore, type Reminder } from "../../store/app";
import { scheduleAlarm, cancelAlarm, requestNotificationPermission } from "../../lib/notifications";
import { haptic } from "../../lib/capacitor";

export function ReminderTab() {
  const reminders = useAppStore((s) => s.reminders);
  const { addReminder, removeReminder, updateReminder, toggleReminder } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // quick add from notification panel — parse ?title=...&date=...&time=...
  useEffect(() => {
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
  }, [addReminder]);

  const sorted = [...reminders].sort(
    (a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
  );
  const future = sorted.filter((r) => new Date(`${r.date}T${r.time}`) >= now);
  const past = sorted.filter((r) => new Date(`${r.date}T${r.time}`) < now);

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

  return (
    <div className="tab-content flex h-full flex-col gap-4 overflow-y-auto p-5 pb-28">
      <div className="rounded-2xl border border-dashed border-border bg-surface-2/50 p-4">
        <h3 className="text-sm font-semibold text-text-secondary">Add from notification panel</h3>
        <p className="mt-1 text-xs text-muted">
          Share to app with <code>?title=&date=&time=</code> query
        </p>
      </div>

      {future.length === 0 && (
        <div className="rounded-3xl border border-dashed border-border bg-surface-2/50 p-8 text-center">
          <p className="text-text-secondary">No upcoming reminders</p>
        </div>
      )}

      {future.map((r) => (
        <ReminderCard
          key={r.id}
          reminder={r}
          onToggle={() => handleToggle(r)}
          onRemove={() => removeReminder(r.id)}
          onUpdate={(patch) => updateReminder(r.id, patch)}
        />
      ))}

      {past.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-text-secondary">Past</h3>
          {past.map((r) => (
            <ReminderCard
              key={r.id}
              reminder={r}
              onToggle={() => handleToggle(r)}
              onRemove={() => removeReminder(r.id)}
              onUpdate={(patch) => updateReminder(r.id, patch)}
            />
          ))}
        </>
      )}

      <Button onClick={() => setIsAdding(true)} className="mt-2 w-full" size="lg">
        <Plus className="mr-2 h-5 w-5" /> New Reminder
      </Button>

      {isAdding && (
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
      )}
    </div>
  );
}

function ReminderCard({
  reminder,
  onToggle,
  onRemove,
  onUpdate,
}: {
  reminder: Reminder;
  onToggle: () => void;
  onRemove: () => void;
  onUpdate: (patch: Partial<Reminder>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const repeatLabels: Record<string, string> = {
    none: "Once",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
  };

  return (
    <div className={`rounded-3xl border bg-surface-2 p-4 transition ${reminder.enabled ? "border-primary/30" : "border-border"}`}>
      <div className="flex items-center gap-3">
        <div className={`rounded-2xl p-3 ${reminder.enabled ? "bg-primary/10 text-primary" : "bg-surface-3 text-text-secondary"}`}>
          <Bell className="h-6 w-6" />
        </div>
        <div className="flex-1" onClick={() => setExpanded(!expanded)}>
          <p className="font-semibold text-text">{reminder.title}</p>
          <p className="text-sm text-text-secondary">
            {new Date(`${reminder.date}T${reminder.time}`).toLocaleString("th-TH", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            · {repeatLabels[reminder.repeat]}
          </p>
        </div>
        <button
          onClick={onToggle}
          className={`h-6 w-6 rounded-full border-2 ${reminder.enabled ? "border-primary bg-primary" : "border-text-secondary"}`}
        >
          {reminder.enabled && <span className="block h-3 w-3 translate-x-[3px] translate-y-[3px] rounded-full bg-white" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 flex items-center gap-1 text-xs text-text-secondary">
                <Calendar className="h-3 w-3" /> Date
              </label>
              <input
                type="date"
                value={reminder.date}
                onChange={(e) => onUpdate({ date: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-3 px-3 py-2 text-sm text-text"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 flex items-center gap-1 text-xs text-text-secondary">
                <Clock className="h-3 w-3" /> Time
              </label>
              <input
                type="time"
                value={reminder.time}
                onChange={(e) => onUpdate({ time: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-3 px-3 py-2 text-sm text-text"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1 text-xs text-text-secondary">
              <Repeat className="h-3 w-3" /> Repeat
            </label>
            <div className="flex gap-2">
              {(["none", "daily", "weekly", "monthly"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => onUpdate({ repeat: r })}
                  className={`flex-1 rounded-xl py-2 text-xs font-medium capitalize transition ${
                    reminder.repeat === r
                      ? "bg-primary text-white"
                      : "bg-surface-3 text-text-secondary"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={onRemove} variant="danger" className="w-full">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      )}
    </div>
  );
}

function AddReminderModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (r: Reminder) => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [time, setTime] = useState("09:00");
  const [repeat, setRepeat] = useState<Reminder["repeat"]>("none");

  function save() {
    onAdd({
      id: `r_${Date.now()}`,
      title: title || "Reminder",
      date,
      time,
      repeat,
      enabled: true,
      createdAt: Date.now(),
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-3xl bg-surface p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <Bell className="h-6 w-6 text-primary" /> New Reminder
        </h2>
        <Input value={title} onChange={setTitle} placeholder="What to remember?" className="mb-3" />
        <div className="mb-3 flex gap-2">
          <Input type="date" value={date} onChange={setDate} />
          <Input type="time" value={time} onChange={setTime} />
        </div>
        <div className="mb-5">
          <label className="mb-2 block text-sm text-text-secondary">Repeat</label>
          <div className="flex gap-2">
            {(["none", "daily", "weekly", "monthly"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRepeat(r)}
                className={`flex-1 rounded-xl py-2 text-xs font-medium capitalize transition ${
                  repeat === r ? "bg-primary text-white" : "bg-surface-3 text-text-secondary"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={onClose} variant="secondary" className="flex-1">Cancel</Button>
          <Button onClick={save} className="flex-1">Save</Button>
        </div>
      </div>
    </div>
  );
}

function hashId(id: string): number {
  // deterministic small positive int for Capacitor notification id
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h << 5) - h + id.charCodeAt(i);
  return Math.abs(h) % 2147483647;
}
