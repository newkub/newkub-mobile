import { useState } from "react";
import {
  Plus,
  Trash2,
  Music,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Wand2,
} from "lucide-react";
import { useAppStore, type Alarm, type Day } from "../store/app";
import { TimePicker } from "../components/TimePicker";
import { Button } from "../components/Button";
import { Switch } from "../components/Switch";
import { Input } from "../components/Input";
import { generateSound } from "../lib/elevenlabs";
import { playAlarmPreview, stopAudio } from "../lib/audio";
import { haptic } from "../lib/capacitor";
import { scheduleAlarm, cancelAlarm } from "../lib/notifications";

const DAYS: Day[] = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
const DAY_LABELS: Record<Day, string> = {
  MO: "M",
  TU: "T",
  WE: "W",
  TH: "T",
  FR: "F",
  SA: "S",
  SU: "S",
};

export function AlarmTab() {
  const alarms = useAppStore((s) => s.alarms);
  const addAlarm = useAppStore((s) => s.addAlarm);
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="tab-content flex h-full flex-col gap-4 overflow-y-auto p-5 pb-24">
      <CurrentAlarmCard />
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">My Alarms</h2>
        <span className="text-sm text-text-secondary">{alarms.filter((a) => a.enabled).length} on</span>
      </div>
      {alarms.length === 0 && !isAdding && (
        <div className="rounded-3xl border border-dashed border-border bg-surface-2/50 p-8 text-center">
          <p className="text-text-secondary">No alarm yet. Tap + to add one.</p>
        </div>
      )}
      {alarms.map((alarm) => (
        <AlarmItem key={alarm.id} alarm={alarm} />
      ))}
      <Button
        onClick={() => setIsAdding(true)}
        className="mt-2 w-full"
        size="lg"
      >
        <Plus className="mr-2 h-5 w-5" /> New Alarm
      </Button>
      {isAdding && <AddAlarmModal onClose={() => setIsAdding(false)} onAdd={addAlarm} />}
    </div>
  );
}

function CurrentAlarmCard() {
  const now = new Date();
  const next = useAppStore((s) =>
    s.alarms
      .filter((a) => a.enabled)
      .map((a) => new Date(now.setHours(a.hour, a.minute, 0, 0)))
      .sort((d1, d2) => d1.getTime() - d2.getTime())[0]
  );

  if (!next) {
    return (
      <div className="rounded-3xl bg-surface-2 p-6 text-center">
        <p className="text-text-secondary">No active alarms</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-gradient-to-br from-primary/20 to-accent/10 p-6 text-center glow-primary">
      <p className="text-sm text-text-secondary">Next alarm</p>
      <p className="mt-2 text-5xl font-bold text-glow">
        {next.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
      </p>
      <p className="mt-1 text-text-secondary">{next.toLocaleDateString("th-TH", { weekday: "long" })}</p>
    </div>
  );
}

function AlarmItem({ alarm }: { alarm: Alarm }) {
  const { updateAlarm, removeAlarm, toggleAlarm } = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const preview = useAppStore((s) => s.alarms.find((a) => a.id === alarm.id)?.soundUrl);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  async function handleToggle(enabled: boolean) {
    toggleAlarm(alarm.id);
    if (enabled) {
      await haptic("success");
      const next = new Date();
      next.setHours(alarm.hour, alarm.minute, 0, 0);
      if (next < new Date()) next.setDate(next.getDate() + 1);
      await scheduleAlarm({
        id: parseInt(alarm.id.replace(/\D/g, "").slice(0, 9) || "1"),
        title: alarm.label || "Alarm",
        body: "Time to wake up!",
        schedule: { at: next },
      });
    } else {
      await haptic("light");
      await cancelAlarm(parseInt(alarm.id.replace(/\D/g, "").slice(0, 9) || "1"));
    }
  }

  return (
    <div className="rounded-3xl bg-surface-2 p-4 transition">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex flex-1 items-center gap-4 text-left"
        >
          <div>
            <p className="text-3xl font-bold tabular-nums">
              {alarm.hour.toString().padStart(2, "0")}:
              {alarm.minute.toString().padStart(2, "0")}
            </p>
            <p className="text-sm text-text-secondary">{alarm.label || "Alarm"}</p>
          </div>
          {expanded ? <ChevronUp className="ml-auto h-5 w-5 text-text-secondary" /> : <ChevronDown className="ml-auto h-5 w-5 text-text-secondary" />}
        </button>
        <Switch
          checked={alarm.enabled}
          onChange={(v) => handleToggle(v)}
        />
      </div>
      <div className="mt-3 flex gap-1">
        {DAYS.map((d) => (
          <span
            key={d}
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
              alarm.repeat.includes(d)
                ? "bg-primary text-white"
                : "bg-surface-3 text-text-secondary"
            }`}
          >
            {DAY_LABELS[d]}
          </span>
        ))}
      </div>
      {expanded && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <Input
            label="Label"
            value={alarm.label}
            onChange={(v) => updateAlarm(alarm.id, { label: v })}
          />
          <div>
            <label className="mb-2 block text-sm text-text-secondary">Sound</label>
            <div className="flex gap-2">
              {(["beep", "bell", "ai"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => updateAlarm(alarm.id, { sound: s })}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-medium capitalize transition ${
                    alarm.sound === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface-3 text-text-secondary"
                  }`}
                >
                  <Music className="h-4 w-4" />
                  {s}
                </button>
              ))}
            </div>
          </div>
          {alarm.sound === "ai" && (
            <AiSoundEditor alarm={alarm} preview={preview} onAudio={setAudio} audio={audio} />
          )}
          <Button
            onClick={() => removeAlarm(alarm.id)}
            variant="danger"
            className="w-full"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      )}
    </div>
  );
}

function AiSoundEditor({
  alarm,
  preview,
  onAudio,
  audio,
}: {
  alarm: Alarm;
  preview?: string;
  onAudio: (a: HTMLAudioElement | null) => void;
  audio: HTMLAudioElement | null;
}) {
  const { updateAlarm } = useAppStore();
  const key = useAppStore((s) => s.elevenLabsKey);
  const [text, setText] = useState(alarm.aiText || "Time to wake up, it's a beautiful day!");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!key) {
      alert("Please set your ElevenLabs API key in Settings first.");
      return;
    }
    setLoading(true);
    const url = await generateSound(text, key);
    if (url) {
      updateAlarm(alarm.id, { soundUrl: url, aiText: text });
      onAudio(null);
    } else {
      alert("Failed to generate sound. Check API key.");
    }
    setLoading(false);
  }

  function play() {
    if (preview) {
      stopAudio(audio);
      onAudio(playAlarmPreview(preview));
    }
  }

  function stop() {
    stopAudio(audio);
    onAudio(null);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-3/50 p-4">
      <label className="mb-2 flex items-center gap-2 text-sm text-accent">
        <Sparkles className="h-4 w-4" /> AI voice prompt
      </label>
      <Input
        value={text}
        onChange={setText}
        placeholder="What should the AI say?"
      />
      <div className="mt-3 flex gap-2">
        <Button onClick={generate} className="flex-1" disabled={loading}>
          <Wand2 className="mr-2 h-4 w-4" />
          {loading ? "Generating..." : "Generate"}
        </Button>
        {preview && (
          <Button onClick={audio ? stop : play} variant="secondary" className="flex-1">
            {audio ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {audio ? "Stop" : "Preview"}
          </Button>
        )}
      </div>
      {preview && (
        <p className="mt-2 text-xs text-success">AI sound ready ✦</p>
      )}
    </div>
  );
}

function AddAlarmModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (a: Alarm) => void;
}) {
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);
  const [label, setLabel] = useState("");
  const [repeat, setRepeat] = useState<Day[]>(["MO", "TU", "WE", "TH", "FR"]);
  const [sound, setSound] = useState<Alarm["sound"]>("beep");

  function save() {
    onAdd({
      id: `a_${Date.now()}`,
      hour,
      minute,
      label: label || "Alarm",
      enabled: true,
      repeat,
      sound,
    });
    onClose();
  }

  function toggleDay(d: Day) {
    setRepeat((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-3xl bg-surface p-6">
        <h2 className="mb-4 text-xl font-bold">New Alarm</h2>
        <TimePicker hour={hour} minute={minute} onChange={(h, m) => { setHour(h); setMinute(m); }} />
        <div className="mt-4">
          <Input value={label} onChange={setLabel} placeholder="Label" />
        </div>
        <div className="mt-4">
          <label className="mb-2 block text-sm text-text-secondary">Repeat</label>
          <div className="flex gap-2">
            {DAYS.map((d) => (
              <button
                key={d}
                onClick={() => toggleDay(d)}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                  repeat.includes(d) ? "bg-primary text-white" : "bg-surface-3 text-text-secondary"
                }`}
              >
                {DAY_LABELS[d]}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-2 block text-sm text-text-secondary">Sound</label>
          <div className="flex gap-2">
            {(["beep", "bell", "ai"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSound(s)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-medium capitalize transition ${
                  sound === s
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface-3 text-text-secondary"
                }`}
              >
                <Music className="h-4 w-4" /> {s}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button onClick={onClose} variant="secondary" className="flex-1">Cancel</Button>
          <Button onClick={save} className="flex-1">Save</Button>
        </div>
      </div>
    </div>
  );
}
