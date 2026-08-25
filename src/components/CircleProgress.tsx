type ProgressProps = {
  size?: number;
  stroke?: number;
  progress: number; // 0-1
  color?: string;
  children?: React.ReactNode;
};

export function CircleProgress({
  size = 240,
  stroke = 12,
  progress,
  color = "#6366f1",
  children,
}: ProgressProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * Math.max(0, Math.min(1, progress));

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          style={{
            strokeDasharray: `${dash} ${c}`,
            transition: "stroke-dasharray 0.2s linear",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
