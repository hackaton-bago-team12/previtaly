type ProgressBarProps = {
  label: string;
  value: number;      // 0-100
  maxLabel?: string;
  color?: "primary" | "amber" | "red" | "green";
};

const colorMap = {
  primary: "var(--color-primary)",
  amber:   "#f59e0b",
  red:     "#ef4444",
  green:   "#22c55e",
};

function getAutoColor(value: number): "primary" | "amber" | "red" | "green" {
  if (value >= 70) return "red";
  if (value >= 40) return "amber";
  return "green";
}

export function ProgressBar({ label, value, maxLabel, color }: ProgressBarProps) {
  const resolvedColor = color ?? getAutoColor(value);
  const barColor = colorMap[resolvedColor];

  return (
    <div className="flex items-center gap-3">
      <span className="w-20 flex-shrink-0 text-sm font-medium"
            style={{ color: "var(--color-text-muted)" }}>
        {label}
      </span>
      <div className="flex-1 h-2.5 rounded-full overflow-hidden"
           style={{ background: "var(--color-border)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: barColor }}
        />
      </div>
      {maxLabel && (
        <span className="w-12 text-right text-sm font-semibold flex-shrink-0"
              style={{ color: barColor }}>
          {maxLabel}
        </span>
      )}
    </div>
  );
}
