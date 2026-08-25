type PickerProps = {
  hour: number;
  minute: number;
  onChange: (h: number, m: number) => void;
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function TimePicker({ hour, minute, onChange }: PickerProps) {
  return (
    <div className="flex items-center justify-center gap-4 rounded-3xl bg-surface-2 p-6">
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => onChange((hour + 1) % 24, minute)}
          className="rounded-xl bg-surface-3 p-3 text-text-secondary hover:text-text"
        >
          ▲
        </button>
        <div className="text-6xl font-bold tabular-nums text-glow">{pad(hour)}</div>
        <button
          onClick={() => onChange((hour + 23) % 24, minute)}
          className="rounded-xl bg-surface-3 p-3 text-text-secondary hover:text-text"
        >
          ▼
        </button>
      </div>
      <span className="pb-2 text-5xl font-light text-muted">:</span>
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => onChange(hour, (minute + 1) % 60)}
          className="rounded-xl bg-surface-3 p-3 text-text-secondary hover:text-text"
        >
          ▲
        </button>
        <div className="text-6xl font-bold tabular-nums text-glow">{pad(minute)}</div>
        <button
          onClick={() => onChange(hour, (minute + 59) % 60)}
          className="rounded-xl bg-surface-3 p-3 text-text-secondary hover:text-text"
        >
          ▼
        </button>
      </div>
    </div>
  );
}
