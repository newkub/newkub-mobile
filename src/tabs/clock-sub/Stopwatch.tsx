import { useState, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Flag, Share2 } from "lucide-react";
import { CircleProgress } from "../../components/CircleProgress";
import { Button } from "../../components/Button";
import { useInterval } from "../../hooks/use-interval";
import { haptic } from "../../lib/capacitor";

interface Lap {
  id: number;
  split: number;
  total: number;
}

function format(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`;
}

export function StopwatchTab() {
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [laps, setLaps] = useState<Lap[]>([]);
  const startRef = useRef(0);
  const offsetRef = useRef(0);

  useInterval(
    () => {
      setTime(offsetRef.current + (Date.now() - startRef.current));
    },
    running ? 16 : null
  );

  const start = useCallback(() => {
    startRef.current = Date.now();
    setRunning(true);
    haptic("medium");
  }, []);

  const stop = useCallback(() => {
    offsetRef.current = time;
    setRunning(false);
    haptic("heavy");
  }, [time]);

  const reset = useCallback(() => {
    setRunning(false);
    setTime(0);
    setLaps([]);
    offsetRef.current = 0;
    haptic("light");
  }, []);

  const lap = useCallback(() => {
    const prev = laps.length ? laps[laps.length - 1].total : 0;
    setLaps((prevList) => [
      ...prevList,
      { id: prevList.length + 1, split: time - prev, total: time },
    ]);
    haptic("light");
  }, [laps, time]);

  const bestLap = laps.length ? Math.min(...laps.map((l) => l.split)) : null;
  const worstLap = laps.length ? Math.max(...laps.map((l) => l.split)) : null;

  async function shareLaps() {
    const text = laps.map((l) => `Lap ${l.id}: ${format(l.split)} / ${format(l.total)}`).join("\n");
    if (navigator.share) {
      await navigator.share({ title: "Stopwatch laps", text });
    } else {
      await navigator.clipboard.writeText(text);
      alert("Laps copied to clipboard");
    }
    haptic("success");
  }

  return (
    <div className="tab-content flex h-full flex-col items-center gap-6 overflow-y-auto p-5 pb-28">
      <div className="mt-4 flex flex-col items-center gap-2">
        <CircleProgress progress={0} size={260} stroke={10}>
          <div className="text-center">
            <p className="text-6xl font-bold tabular-nums text-glow">{format(time)}</p>
            <p className="mt-1 text-sm text-text-secondary">{laps.length} lap{laps.length !== 1 ? "s" : ""}</p>
          </div>
        </CircleProgress>
      </div>

      <div className="flex w-full max-w-sm gap-3">
        <Button
          onClick={running ? stop : start}
          className="h-16 flex-1 rounded-3xl text-xl"
          variant={running ? "danger" : "primary"}
        >
          {running ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
          {running ? "Stop" : "Start"}
        </Button>
        {running ? (
          <Button onClick={lap} className="h-16 flex-1 rounded-3xl text-xl" variant="secondary">
            <Flag className="mr-2 h-5 w-5" /> Lap
          </Button>
        ) : (
          <Button onClick={reset} className="h-16 flex-1 rounded-3xl text-xl" variant="secondary">
            <RotateCcw className="mr-2 h-5 w-5" /> Reset
          </Button>
        )}
      </div>

      {laps.length > 0 && (
        <Button onClick={shareLaps} variant="ghost" size="sm" className="-mt-2">
          <Share2 className="mr-2 h-4 w-4" /> Export laps
        </Button>
      )}

      {laps.length > 0 && (
        <div className="w-full max-w-sm rounded-3xl bg-surface-2 p-4">
          <h3 className="mb-2 text-sm font-semibold text-text-secondary uppercase tracking-wide">Laps</h3>
          <div className="max-h-52 space-y-2 overflow-y-auto">
            {[...laps].reverse().map((lap) => {
              const isBest = lap.split === bestLap;
              const isWorst = lap.split === worstLap && laps.length > 2;
              return (
                <div
                  key={lap.id}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
                    isBest ? "border-success/30 bg-success/10" : isWorst ? "border-danger/30 bg-danger/10" : "border-border bg-surface-3"
                  }`}
                >
                  <span className="text-sm text-text-secondary">Lap {lap.id}</span>
                  <div className="text-right">
                    <p className="font-mono text-lg font-semibold">{format(lap.split)}</p>
                    <p className="text-xs text-muted">{format(lap.total)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
