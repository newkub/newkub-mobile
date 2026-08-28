import { createSignal, createMemo, For, Show } from "solid-js";
import {
  appStore,
  addAlarm,
  updateAlarm,
  removeAlarm,
  toggleAlarm,
  type Alarm,
  type Day,
} from "../../store/app";
import { TimePicker } from "../../components/TimePicker";
import { Button } from "../../components/Button";
import { Switch } from "../../components/Switch";
import { Input } from "../../components/Input";
import { generateSound } from "../../lib/elevenlabs";
import { playAlarmPreview, stopAudio } from "../../lib/audio";
import { haptic } from "../../lib/capacitor";
import { scheduleAlarm, cancelAlarm } from "../../lib/notifications";
import { hashId } from "../../lib/hash";

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

function CurrentAlarmCard() {
  const next = createMemo(() => {
    const enabled = appStore.alarms.filter((a) => a.enabled);
    if (!enabled.length) return null;
    const dates = enabled
      .map((a) => {
        const d = new Date();
        d.setHours(a.hour, a.minute, 0, 0);
        if (d < new Date()) d.setDate(d.getDate() + 1);
        return d;
      })
      .sort((d1, d2) => d1.getTime() - d2.getTime());
    return dates[0];
  });

  return (
    <Show when={next()} fallback={<div class="rounded-3xl bg-surface-2 p-6 text-center"><p class="text-text-secondary">No active alarms</p></div>}>
      <div class="rounded-3xl bg-gradient-to-br from-primary/20 to-accent/10 p-6 text-center glow-primary">
        <p class="text-sm text-text-secondary">Next alarm</p>
        <p class="mt-2 text-5xl font-bold text-glow">
          {next()?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
        </p>
        <p class="mt-1 text-text-secondary">{next()?.toLocaleDateString("th-TH", { weekday: "long" })}</p>
      </div>
    </Show>
  );
}

function AiSoundEditor(props: { alarm: Alarm }) {
  const [text, setText] = createSignal(props.alarm.aiText ?? "Time to wake up, it's a beautiful day!");
  const [loading, setLoading] = createSignal(false);
  const [audio, setAudio] = createSignal<HTMLAudioElement | null>(null);
  const preview = createMemo(() => appStore.alarms.find((a) => a.id === props.alarm.id)?.soundUrl);

  async function generate() {
    if (!appStore.elevenLabsKey) {
      alert("Please set your ElevenLabs API key in Settings first.");
      return;
    }
    setLoading(true);
    const url = await generateSound(text(), appStore.elevenLabsKey);
    if (url) {
      updateAlarm(props.alarm.id, { soundUrl: url, aiText: text() });
      stopAudio(audio());
      setAudio(null);
    } else {
      alert("Failed to generate sound. Check API key.");
    }
    setLoading(false);
  }

  function play() {
    const url = preview();
    if (url) {
      stopAudio(audio());
      setAudio(playAlarmPreview(url));
    }
  }

  function stop() {
    stopAudio(audio());
    setAudio(null);
  }

  return (
    <div class="rounded-2xl border border-border bg-surface-3/50 p-4">
      <label class="mb-2 flex items-center gap-2 text-sm text-accent">
        <span class="i-mdi-sparkles h-4 w-4" /> AI voice prompt
      </label>
      <Input value={text()} onChange={setText} placeholder="What should the AI say?" />
      <div class="mt-3 flex gap-2">
        <Button onClick={generate} class="flex-1" disabled={loading()}>
          <span class="i-mdi-wand mr-2 h-4 w-4" />
          {loading() ? "Generating..." : "Generate"}
        </Button>
        <Show when={preview()}>
          <Button onClick={audio() ? stop : play} variant="secondary" class="flex-1">
            {audio() ? (
              <>
                <span class="i-mdi-pause mr-2 h-4 w-4" /> Stop
              </>
            ) : (
              <>
                <span class="i-mdi-play mr-2 h-4 w-4" /> Preview
              </>
            )}
          </Button>
        </Show>
      </div>
      <Show when={preview()}>
        <p class="mt-2 text-xs text-success">AI sound ready ✦</p>
      </Show>
    </div>
  );
}

function AlarmItem(props: { alarm: Alarm }) {
  const [expanded, setExpanded] = createSignal(false);

  async function handleToggle(enabled: boolean) {
    toggleAlarm(props.alarm.id);
    if (enabled) {
      await haptic("success");
      const next = new Date();
      next.setHours(props.alarm.hour, props.alarm.minute, 0, 0);
      if (next < new Date()) next.setDate(next.getDate() + 1);
      await scheduleAlarm({
        id: hashId(props.alarm.id),
        title: props.alarm.label || "Alarm",
        body: "Time to wake up!",
        schedule: { at: next },
      });
    } else {
      await haptic("light");
      await cancelAlarm(hashId(props.alarm.id));
    }
  }

  return (
    <div class="rounded-3xl bg-surface-2 p-4 transition">
      <div class="flex items-center justify-between">
        <button onClick={() => setExpanded(!expanded())} class="flex flex-1 items-center gap-4 text-left">
          <div>
            <p class="text-3xl font-bold tabular-nums">
              {props.alarm.hour.toString().padStart(2, "0")}:{props.alarm.minute.toString().padStart(2, "0")}
            </p>
            <p class="text-sm text-text-secondary">{props.alarm.label || "Alarm"}</p>
          </div>
          {expanded() ? (
            <span class="i-mdi-chevron-up ml-auto h-5 w-5 text-text-secondary" />
          ) : (
            <span class="i-mdi-chevron-down ml-auto h-5 w-5 text-text-secondary" />
          )}
        </button>
        <Switch checked={props.alarm.enabled} onChange={(v) => handleToggle(v)} />
      </div>
      <div class="mt-3 flex gap-1">
        <For each={DAYS}>
          {(d) => (
            <span
              class={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                props.alarm.repeat.includes(d)
                  ? "bg-primary text-white"
                  : "bg-surface-3 text-text-secondary"
              }`}
            >
              {DAY_LABELS[d]}
            </span>
          )}
        </For>
      </div>
      <Show when={expanded()}>
        <div class="mt-4 space-y-3 border-t border-border pt-4">
          <Input
            label="Label"
            value={props.alarm.label}
            onChange={(v) => updateAlarm(props.alarm.id, { label: v })}
          />
          <div>
            <label class="mb-2 block text-sm text-text-secondary">Sound</label>
            <div class="flex gap-2">
              <For each={["beep", "bell", "ai"] as const}>
                {(s) => (
                  <button
                    onClick={() => updateAlarm(props.alarm.id, { sound: s })}
                    class={`flex flex-1 items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-medium capitalize transition ${
                      props.alarm.sound === s
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-surface-3 text-text-secondary"
                    }`}
                  >
                    <span class="i-mdi-music h-4 w-4" />
                    {s}
                  </button>
                )}
              </For>
            </div>
          </div>
          <Show when={props.alarm.sound === "ai"}>
            <AiSoundEditor alarm={props.alarm} />
          </Show>
          <Button onClick={() => removeAlarm(props.alarm.id)} variant="danger" class="w-full">
            <span class="i-mdi-delete mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </Show>
    </div>
  );
}

function AddAlarmModal(props: { onClose: () => void }) {
  const [hour, setHour] = createSignal(7);
  const [minute, setMinute] = createSignal(30);
  const [label, setLabel] = createSignal("");
  const [repeat, setRepeat] = createSignal<Day[]>(["MO", "TU", "WE", "TH", "FR"]);
  const [sound, setSound] = createSignal<Alarm["sound"]>("beep");

  function save() {
    addAlarm({
      id: `a_${Date.now()}`,
      hour: hour(),
      minute: minute(),
      label: label() || "Alarm",
      enabled: true,
      repeat: repeat(),
      sound: sound(),
    });
    props.onClose();
  }

  function toggleDay(d: Day) {
    setRepeat((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  return (
    <div class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4">
      <div class="w-full max-w-md rounded-3xl bg-surface p-6">
        <h2 class="mb-4 text-xl font-bold">New Alarm</h2>
        <TimePicker hour={hour()} minute={minute()} onChange={(h, m) => { setHour(h); setMinute(m); }} />
        <div class="mt-4">
          <Input value={label()} onChange={setLabel} placeholder="Label" />
        </div>
        <div class="mt-4">
          <label class="mb-2 block text-sm text-text-secondary">Repeat</label>
          <div class="flex gap-2">
            <For each={DAYS}>
              {(d) => (
                <button
                  onClick={() => toggleDay(d)}
                  class={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                    repeat().includes(d) ? "bg-primary text-white" : "bg-surface-3 text-text-secondary"
                  }`}
                >
                  {DAY_LABELS[d]}
                </button>
              )}
            </For>
          </div>
        </div>
        <div class="mt-4">
          <label class="mb-2 block text-sm text-text-secondary">Sound</label>
          <div class="flex gap-2">
            <For each={["beep", "bell", "ai"] as const}>
              {(s) => (
                <button
                  onClick={() => setSound(s)}
                  class={`flex flex-1 items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-medium capitalize transition ${
                    sound() === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface-3 text-text-secondary"
                  }`}
                >
                  <span class="i-mdi-music h-4 w-4" /> {s}
                </button>
              )}
            </For>
          </div>
        </div>
        <div class="mt-6 flex gap-3">
          <Button onClick={props.onClose} variant="secondary" class="flex-1">Cancel</Button>
          <Button onClick={save} class="flex-1">Save</Button>
        </div>
      </div>
    </div>
  );
}

export function AlarmTab() {
  const [isAdding, setIsAdding] = createSignal(false);

  return (
    <div class="tab-content flex h-full flex-col gap-4 overflow-y-auto p-5 pb-24">
      <CurrentAlarmCard />
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-text">My Alarms</h2>
        <span class="text-sm text-text-secondary">{appStore.alarms.filter((a) => a.enabled).length} on</span>
      </div>
      <Show when={appStore.alarms.length === 0 && !isAdding()}>
        <div class="rounded-3xl border border-dashed border-border bg-surface-2/50 p-8 text-center">
          <p class="text-text-secondary">No alarm yet. Tap + to add one.</p>
        </div>
      </Show>
      <For each={appStore.alarms}>
        {(alarm) => <AlarmItem alarm={alarm} />}
      </For>
      <Button onClick={() => setIsAdding(true)} class="mt-2 w-full" size="lg">
        <span class="i-mdi-plus mr-2 h-5 w-5" /> New Alarm
      </Button>
      <Show when={isAdding()}>
        <AddAlarmModal onClose={() => setIsAdding(false)} />
      </Show>
    </div>
  );
}
