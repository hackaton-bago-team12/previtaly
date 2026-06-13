"use client";

type Point = { label: string; value: number };

export function PulseChart({ data, color = "var(--color-primary)" }: {
  data: Point[];
  color?: string;
}) {
  if (!data.length) return null;

  const W = 280;
  const H = 60;
  const PAD = 4;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const toX = (i: number) => PAD + (i / (data.length - 1)) * (W - PAD * 2);
  const toY = (v: number) => H - PAD - ((v - min) / range) * (H - PAD * 2);

  const pathD = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(d.value).toFixed(1)}`)
    .join(" ");

  // Area fill path
  const areaD = `${pathD} L ${toX(data.length - 1).toFixed(1)} ${H} L ${toX(0).toFixed(1)} ${H} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        <defs>
          <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Area */}
        <path d={areaD} fill="url(#pulseGrad)" />
        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {data.map((d, i) => (
          <circle key={i} cx={toX(i)} cy={toY(d.value)} r="3"
                  fill={color} stroke="white" strokeWidth="1.5" />
        ))}
      </svg>
      {/* Labels */}
      <div className="flex justify-between mt-1">
        {data.map((d) => (
          <span key={d.label} className="text-[10px]" style={{ color: "var(--color-text-subtle)" }}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SparkLine({ values, color = "var(--color-primary)" }: {
  values: number[];
  color?: string;
}) {
  if (values.length < 2) return null;

  const W = 120;
  const H = 32;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const toX = (i: number) => (i / (values.length - 1)) * W;
  const toY = (v: number) => H - 2 - ((v - min) / range) * (H - 4);

  const pathD = values
    .map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: W, height: H }}>
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
