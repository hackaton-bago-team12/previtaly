"use client";

type Point = { label: string; value: number };

/** Gráfico de anillo (donut) para una métrica 0-100. */
export function DonutChart({
  value,
  label,
  sublabel,
  color = "var(--color-primary)",
  size = 100,
  delta,
}: {
  value: number;
  label: string;
  sublabel?: string;
  color?: string;
  size?: number;
  delta?: number; // diferencia vs registro anterior
}) {
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size / 2;
  const stroke = size * 0.1;
  const circumference = 2 * Math.PI * r;
  const filled = (Math.min(100, Math.max(0, value)) / 100) * circumference;
  const gap = circumference - filled;

  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none"
            stroke="var(--color-border)" strokeWidth={stroke} />
          {/* Fill */}
          <circle cx={cx} cy={cy} r={r} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${gap}`} />
        </svg>
        {/* Valor central */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: size * 0.22, fontWeight: 700, color, lineHeight: 1 }}>
            {value}
          </span>
          {delta !== undefined && (
            <span style={{
              fontSize: size * 0.13,
              color: delta >= 0 ? "var(--color-risk-low)" : "var(--color-risk-high)",
              lineHeight: 1,
            }}>
              {delta >= 0 ? `+${delta}` : delta}
            </span>
          )}
        </div>
      </div>
      <p style={{ fontSize: size * 0.13, fontWeight: 600, color: "var(--color-text)", textAlign: "center" }}>
        {label}
      </p>
      {sublabel && (
        <p style={{ fontSize: size * 0.11, color: "var(--color-text-subtle)", textAlign: "center" }}>
          {sublabel}
        </p>
      )}
    </div>
  );
}

/**
 * Gráfico de dispersión Horas trabajadas vs Desempeño.
 * Muestra una curva de rendimiento predecida y señala dónde está el médico hoy.
 */
export function PerformanceCurveChart({
  horasTrabajadas,
  indicePulso,
  concentracion,
  capacidadRestante,
}: {
  horasTrabajadas: number;
  indicePulso: number;
  concentracion: number;
  capacidadRestante: number;
}) {
  const W = 280;
  const H = 90;
  const PAD_X = 28;
  const PAD_Y = 10;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_Y * 2;

  // Curva de rendimiento predecida (decae con horas)
  const maxHoras = 16;
  const points = Array.from({ length: 33 }, (_, i) => {
    const h = (i / 32) * maxHoras;
    // Modelo: alto rendimiento hasta ~6h, luego decae
    const perf = Math.round(100 * Math.exp(-0.045 * Math.max(0, h - 6)));
    return { h, perf };
  });

  const toX = (h: number) => PAD_X + (h / maxHoras) * innerW;
  const toY = (p: number) => PAD_Y + innerH - (p / 100) * innerH;

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.h).toFixed(1)} ${toY(p.perf).toFixed(1)}`)
    .join(" ");

  // Punto actual del médico: desempeño promedio de sus métricas
  const avgPerf = Math.round((indicePulso + concentracion + capacidadRestante) / 3);
  const dotX = toX(Math.min(horasTrabajadas, maxHoras));
  const dotY = toY(avgPerf);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {/* Eje X labels */}
        {[0, 4, 8, 12, 16].map((h) => (
          <text key={h} x={toX(h)} y={H - 1} textAnchor="middle"
                style={{ fontSize: 8, fill: "var(--color-text-subtle)" }}>
            {h}h
          </text>
        ))}
        {/* Eje Y labels */}
        {[0, 50, 100].map((p) => (
          <text key={p} x={PAD_X - 4} y={toY(p) + 3} textAnchor="end"
                style={{ fontSize: 8, fill: "var(--color-text-subtle)" }}>
            {p}%
          </text>
        ))}
        {/* Zona óptima (0-8h) */}
        <rect x={toX(0)} y={PAD_Y} width={toX(8) - toX(0)} height={innerH}
              fill="var(--color-risk-low-bg)" opacity="0.4" />
        {/* Zona fatiga (8-12h) */}
        <rect x={toX(8)} y={PAD_Y} width={toX(12) - toX(8)} height={innerH}
              fill="var(--color-risk-mid-bg)" opacity="0.4" />
        {/* Zona crítica (>12h) */}
        <rect x={toX(12)} y={PAD_Y} width={toX(16) - toX(12)} height={innerH}
              fill="var(--color-risk-high-bg)" opacity="0.4" />
        {/* Curva de rendimiento */}
        <path d={pathD} fill="none" stroke="var(--color-primary)"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        {/* Línea vertical del médico hoy */}
        <line x1={dotX} y1={PAD_Y} x2={dotX} y2={H - PAD_Y}
              stroke="var(--color-text-subtle)" strokeWidth="1" strokeDasharray="3 2" />
        {/* Punto del médico */}
        <circle cx={dotX} cy={dotY} r="5"
                fill="var(--color-primary)" stroke="white" strokeWidth="2" />
        {/* Etiqueta del punto */}
        <text x={dotX + 7} y={dotY + 4}
              style={{ fontSize: 9, fontWeight: 700, fill: "var(--color-primary)" }}>
          {avgPerf}%
        </text>
      </svg>
      <div className="flex gap-3 mt-1 justify-center" style={{ fontSize: 10, color: "var(--color-text-subtle)" }}>
        <span style={{ color: "var(--color-risk-low)" }}>● Óptimo (0-8h)</span>
        <span style={{ color: "var(--color-risk-mid)" }}>● Fatiga (8-12h)</span>
        <span style={{ color: "var(--color-risk-high)" }}>● Crítico (+12h)</span>
      </div>
    </div>
  );
}

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
        {data.map((d, i) => (
          <span key={i} className="text-[10px]" style={{ color: "var(--color-text-subtle)" }}>
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
