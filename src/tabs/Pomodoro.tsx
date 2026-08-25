import { useState, useCallback, useEffect } from "react";
import { Play, Pause, RotateCcw, Coffee, Brain, Trophy } from "lucide-react";
import { CircleProgress } from "../components/CircleProgress";
import { Button } from "../components/Button";
import { useInterval } from "../hooks/use-interval";
import { haptic } from "../lib/capacitor";
import { playBeep } from "../lib/audio";
import { useAppStore } from "../store/app";

const FOCUS_SECONDS = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

type Phase = "focus" | "short" | "long";

function format(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function PomodoroTab() {
  const [phase, setPhase] = useState<Phase>("focus");
  const [remaining, setRemaining] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [focusCount, setFocusCount] = useState(0);
  const sessions = useAppStore((s) => s.pomodoroSessions);
  const addPomodoroSession = useAppStore((s) => s.addPomodoroSession);

  const total = phase === "focus" ? FOCUS_SECONDS : phase === "short" ? SHORT_BREAK : LONG_BREAK;

  useEffect(() => {
    if (running && remaining <= 0) {
      playBeep(880, 0.8, "triangle");
      haptic("success");

      if (phase === "focus") {
        const newFocusCount = focusCount + 1;
        setFocusCount(newFocusCount);
        if (newFocusCount % 4 === 0) {
          setPhase("long");
          setRemaining(LONG_BREAK);
        } else {
          setPhase("short");
          setRemaining(SHORT_BREAK);
        }
        setCompletedCycles((c) => c + 1);
        const today = new Date().toISOString().slice(0, 10);
        const existing = sessions.find((s) => s.date === today);
        if (existing) {
          // day already recorded; we keep simple aggregate
        } else {
          addPomodoroSession({ date: today, completedCycles: completedCycles + 1, totalFocusSeconds: FOCUS_SECONDS });
        }
      } else {
        setPhase("focus");
        setRemaining(FOCUS_SECONDS);
        setRunning(false);
      }
    }
  }, [remaining, running, phase, focusCount, completedCycles, sessions, addPomodoroSession]);

  useInterval(
    () => {
      setRemaining((r) => Math.max(0, r - 1));
    },
    running ? 1000 : null
  );

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);

  function reset() {
    setRunning(false);
    setRemaining(total);
    haptic("light");
  }

  function manualPhase(next: Phase) {
    setRunning(false);
    setPhase(next);
    setRemaining(next === "focus" ? FOCUS_SECONDS : next === "short" ? SHORT_BREAK : LONG_BREAK);
  }

  const progress = (total - remaining) / total;
  const color = phase === "focus" ? "#6366f1" : phase === "short" ? "#22c55e" : "#a855f7";

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySession = sessions.filter((s) => s.date === todayStr);
  const todayCycles = todaySession.reduce((sum, s) => sum + s.completedCycles, 0) || completedCycles;

  return (
    <div className="tab-content flex h-full flex-col items-center gap-5 overflow-y-auto p-5 pb-28">
      <div className="flex rounded-full bg-surface-2 p-1">
        {(["focus", "short", "long"] as Phase[]).map((p) => (
          <button
            key={p}
            onClick={() => manualPhase(p)}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
              phase === p
                ? p === "focus"
                  ? "bg-primary text-white"
                  : p === "short"
                    ? "bg-success text-white"
                    : "bg-accent text-white"
                : "text-text-secondary"
            }`}
          >
            {p === "focus" && <Brain className="mr-1 inline h-4 w-4" />}
            {p === "short" && <Coffee className="mr-1 inline h-4 w-4" />}
            {p === "long" && <Coffee className="mr-1 inline h-4 w-4" />}
            {p}
          </button>
        ))}
      </div>

      <div className="mt-2">
        <CircleProgress progress={progress} size={260} stroke={14} color={color}>
          <div className="text-center">
            <p className="text-6xl font-bold tabular-nums text-glow" style={{ color }}>
              {format(remaining)}
            </p>
            <p className="mt-1 text-sm capitalize text-text-secondary">{phase} time</p>
          </div>
        </CircleProgress>
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

      <div className="grid w-full max-w-sm grid-cols-2 gap-3">
        <div className="rounded-2xl bg-surface-2 p-4 text-center">
          <p className="text-3xl font-bold text-primary">{completedCycles}</p>
          <p className="text-xs text-text-secondary">Cycles this session</p>
        </div>
        <div className="rounded-2xl bg-surface-2 p-4 text-center">
          <p className="text-3xl font-bold text-success">{todayCycles}</p>
          <p className="text-xs text-text-secondary">Today</p>
        </div>
      </div>

      {completedCycles > 0 && completedCycles % 4 === 0 && (
        <div className="flex items-center gap-2 rounded-2xl bg-success/10 p-3 text-success">
          <Trophy className="h-5 w-5" />
          <span className="font-medium">Great focus streak! Take a long break.</span>
        </div>
      )}
    </div>
  );
}
