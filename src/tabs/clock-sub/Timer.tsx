import { useState, useCallback, useEffect } from "react";
import { Play, Pause, RotateCcw, Plus, Save, Trash2 } from "lucide-react";
import { CircleProgress } from "../../components/CircleProgress";
import { Button } from "../../components/Button";
import { useInterval } from "../../hooks/use-interval";
import { haptic } from "../../lib/capacitor";
import { playBeep } from "../../lib/audio";
import { formatDuration } from "../../lib/time";
import { useAppStore, type TimerPreset } from "../../store/app";
import { Input } from "../../components/Input";

function format(total: number) {
  return formatDuration(total);
}

export function TimerTab() {
  const [seconds, setSeconds] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [running, setRunning] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSec, setNewSec] = useState(300);
  const [newColor, setNewColor] = useState("#6366f1");

  const { timerPresets, removeTimerPreset, addTimerPreset } = useAppStore();

  useEffect(() => {
    if (running && remaining <= 0) {
      setRunning(false);
      playBeep(660, 1.2, "sine");
      haptic("success");
    }
  }, [remaining, running]);

  useInterval(
    () => {
      setRemaining((r) => Math.max(0, r - 1));
    },
    running ? 1000 : null
  );

  const start = useCallback(() => {
    setRunning(true);
    haptic("medium");
  }, []);

  const pause = useCallback(() => {
    setRunning(false);
    haptic("light");
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    setRemaining(seconds);
    haptic("light");
  }, [seconds]);

  function selectPreset(p: TimerPreset) {
    setSeconds(p.seconds);
    setRemaining(p.seconds);
    setRunning(false);
    haptic("light");
  }

  function adjust(delta: number) {
    setRemaining((r) => Math.max(0, r + delta));
    setSeconds((s) => Math.max(0, s + delta));
  }

  function addCustom() {
    addTimerPreset({
      id: `tp_${Date.now()}`,
      name: newName || `${newSec}s`,
      seconds: newSec,
      color: newColor,
    });
    setShowAdd(false);
    setNewName("");
    setNewSec(300);
    haptic("success");
  }

  return (
    <div className="tab-content flex h-full flex-col items-center gap-5 overflow-y-auto p-5 pb-28">
      <div className="mt-2">
        <CircleProgress
          progress={seconds > 0 ? (seconds - remaining) / seconds : 0}
          size={260}
          stroke={12}
          color="#6366f1"
        >
          <div className="text-center">
            <p className="text-6xl font-bold tabular-nums text-glow">{format(remaining)}</p>
            <p className="mt-1 text-sm text-text-secondary">
              {running ? "Running" : remaining === seconds ? "Ready" : "Paused"}
            </p>
          </div>
        </CircleProgress>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => adjust(-60)}
          className="rounded-2xl bg-surface-3 px-4 py-2 text-sm text-text-secondary hover:text-text"
        >
          -1m
        </button>
        <button
          onClick={() => adjust(-10)}
          className="rounded-2xl bg-surface-3 px-4 py-2 text-sm text-text-secondary hover:text-text"
        >
          -10s
        </button>
        <button
          onClick={() => adjust(+10)}
          className="rounded-2xl bg-surface-3 px-4 py-2 text-sm text-text-secondary hover:text-text"
        >
          +10s
        </button>
        <button
          onClick={() => adjust(+60)}
          className="rounded-2xl bg-surface-3 px-4 py-2 text-sm text-text-secondary hover:text-text"
        >
          +1m
        </button>
      </div>

      <div className="flex w-full max-w-sm gap-3">
        <Button
          onClick={running ? pause : start}
          className="h-16 flex-1 rounded-3xl text-xl"
          variant={running ? "secondary" : "primary"}
        >
          {running ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
          {running ? "Pause" : "Start"}
        </Button>
        <Button onClick={reset} className="h-16 flex-1 rounded-3xl text-xl" variant="secondary">
          <RotateCcw className="mr-2 h-5 w-5" /> Reset
        </Button>
      </div>

      <div className="w-full max-w-sm rounded-3xl bg-surface-2 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Presets</h3>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1 text-sm font-medium text-primary"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        {showAdd && (
          <div className="mb-4 rounded-2xl border border-border bg-surface-3 p-4">
            <Input value={newName} onChange={setNewName} placeholder="Name" className="mb-2" />
            <div className="mb-3 flex items-center gap-3">
              <input
                type="number"
                value={newSec}
                onChange={(e) => setNewSec(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-28 rounded-xl border border-border bg-surface-2 px-3 py-2 text-text"
              />
              <span className="text-sm text-text-secondary">seconds</span>
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="ml-auto h-10 w-14 rounded-lg bg-transparent"
              />
            </div>
            <Button onClick={addCustom} className="w-full">
              <Save className="mr-2 h-4 w-4" /> Save Preset
            </Button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {timerPresets.map((p) => (
            <div
              key={p.id}
              className="group relative flex items-center gap-2 rounded-full border border-border bg-surface-3 pl-4 pr-2"
            >
              <button
                onClick={() => selectPreset(p)}
                className="py-2 pr-1 text-sm font-medium"
                style={{ color: p.color }}
              >
                {p.name}
              </button>
              <button
                onClick={() => removeTimerPreset(p.id)}
                className="rounded-full p-1 text-text-secondary opacity-0 transition hover:text-danger group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
