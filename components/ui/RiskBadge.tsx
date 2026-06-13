type RiskLevel = "bajo" | "medio" | "alto";
type Tendencia = "subiendo" | "estable" | "bajando";

const riskConfig = {
  bajo:  { label: "Riesgo bajo",       bg: "var(--color-risk-low-bg)",  color: "var(--color-risk-low)",  light: "🟢" },
  medio: { label: "Riesgo medio-alto", bg: "var(--color-risk-mid-bg)",  color: "var(--color-risk-mid)",  light: "🟡" },
  alto:  { label: "Riesgo alto",       bg: "var(--color-risk-high-bg)", color: "var(--color-risk-high)", light: "🔴" },
};

const tendenciaConfig = {
  subiendo: { label: "↑ SUBIENDO", color: "var(--color-risk-mid)" },
  estable:  { label: "→ ESTABLE",  color: "var(--color-risk-low)" },
  bajando:  { label: "↓ BAJANDO",  color: "var(--color-risk-high)" },
};

export function RiskBadge({
  nivel,
  tendencia,
  showTrafficLight = false,
}: {
  nivel: RiskLevel;
  tendencia?: Tendencia;
  showTrafficLight?: boolean;
}) {
  const cfg = riskConfig[nivel];
  const tCfg = tendencia ? tendenciaConfig[tendencia] : null;

  return (
    <div className="rounded-2xl p-4 flex items-center gap-4"
         style={{ background: cfg.bg }}>
      {showTrafficLight && (
        <TrafficLight nivel={nivel} />
      )}
      <div className="flex-1">
        {tCfg && (
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 inline-block"
                style={{ background: cfg.bg, color: tCfg.color }}>
            {tCfg.label}
          </span>
        )}
        <p className="text-xl font-bold" style={{ color: cfg.color }}>
          {cfg.label}
        </p>
      </div>
    </div>
  );
}

function TrafficLight({ nivel }: { nivel: RiskLevel }) {
  return (
    <div className="flex flex-col gap-1 items-center bg-gray-900 rounded-lg p-1.5 w-8">
      <div className={`w-4 h-4 rounded-full ${nivel === "alto" ? "opacity-100" : "opacity-20"}`}
           style={{ background: "#ef4444" }} />
      <div className={`w-4 h-4 rounded-full ${nivel === "medio" ? "opacity-100" : "opacity-20"}`}
           style={{ background: "#f59e0b" }} />
      <div className={`w-4 h-4 rounded-full ${nivel === "bajo" ? "opacity-100" : "opacity-20"}`}
           style={{ background: "#22c55e" }} />
    </div>
  );
}

export function RiskChip({ nivel }: { nivel: RiskLevel }) {
  const cfg = riskConfig[nivel];
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.light} {cfg.label}
    </span>
  );
}
