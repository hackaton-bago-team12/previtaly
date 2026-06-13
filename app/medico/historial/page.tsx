import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ClockIcon } from "@/components/ui/icons";
import { PulseChart, DonutChart } from "@/components/ui/PulseChart";

type AnalysisRow = {
  id: string;
  fecha: string;
  indice_pulso: number;
  concentracion: number;
  estres: number;
  capacidad_restante: number;
  carga_acumulada: number;
  nivel_riesgo: "bajo" | "medio" | "alto";
  tendencia: "subiendo" | "estable" | "bajando";
  detectados: { icono: string; texto: string }[] | null;
};

function formatFecha(fecha: string) {
  return new Date(fecha + "T00:00:00").toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** Barra horizontal de métrica con etiqueta y valor */
function MiniBar({
  label,
  value,
  inverted = false,
}: {
  label: string;
  value: number;
  inverted?: boolean;
}) {
  const good = inverted ? value <= 35 : value >= 65;
  const bad  = inverted ? value >= 65 : value <= 35;
  const color = good
    ? "var(--color-risk-low)"
    : bad
    ? "var(--color-risk-high)"
    : "var(--color-risk-mid)";

  return (
    <div className="space-y-0.5">
      <div className="flex justify-between items-center">
        <span style={{ fontSize: 10, color: "var(--color-text-subtle)", fontWeight: 500 }}>
          {label}
        </span>
        <span style={{ fontSize: 10, color, fontWeight: 700 }}>{value}</span>
      </div>
      <div className="w-full h-1.5 rounded-full" style={{ background: "var(--color-border)" }}>
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

const RIESGO_COLOR: Record<string, string> = {
  bajo:  "var(--color-risk-low)",
  medio: "var(--color-risk-mid)",
  alto:  "var(--color-risk-high)",
};
const RIESGO_BG: Record<string, string> = {
  bajo:  "var(--color-risk-low-bg)",
  medio: "var(--color-risk-mid-bg)",
  alto:  "var(--color-risk-high-bg)",
};
const TENDENCIA_ICON: Record<string, string> = {
  subiendo: "↑",
  estable:  "→",
  bajando:  "↓",
};

export default async function HistorialPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rows } = await supabase
    .from("ai_analysis")
    .select("id, fecha, indice_pulso, concentracion, estres, capacidad_restante, carga_acumulada, nivel_riesgo, tendencia, detectados")
    .eq("medico_id", user.id)
    .order("fecha", { ascending: false })
    .limit(30);

  const history = (rows ?? []) as AnalysisRow[];

  const chartData = [...history].reverse().map((h, i) => ({
    label: new Date(h.fecha + "T00:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "numeric" }),
    value: h.indice_pulso,
    idx: i,
  }));

  const avg = (key: keyof AnalysisRow) =>
    history.length
      ? Math.round(history.reduce((s, h) => s + (h[key] as number), 0) / history.length)
      : 0;

  const avgBienestar      = avg("indice_pulso");
  const avgConcentracion  = avg("concentracion");
  const avgEstres         = avg("estres");
  const avgCapacidad      = avg("capacidad_restante");
  const avgCarga          = avg("carga_acumulada");

  return (
    <div className="px-5 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ClockIcon className="h-5 w-5" style={{ color: "var(--color-primary)" } as React.CSSProperties} />
          <span className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
            Tu progreso
          </span>
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
          Historial de bienestar
        </h1>
        {history.length > 0 && (
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            {history.length} {history.length === 1 ? "registro" : "registros"} — últimos 30 días
          </p>
        )}
      </div>

      {history.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-3xl mb-3">📋</p>
          <p className="font-semibold mb-1" style={{ color: "var(--color-text)" }}>
            Todavía no tenés registros
          </p>
          <p className="text-sm mb-5" style={{ color: "var(--color-text-muted)" }}>
            Completá tu primer check-in para empezar a ver tu historial.
          </p>
          <Link href="/medico" className="btn-primary inline-block w-auto px-6">
            Hacer check-in →
          </Link>
        </div>
      ) : (
        <>
          {/* Gráfico de tendencia */}
          {chartData.length >= 2 && (
            <div className="card">
              <p className="text-xs font-bold uppercase tracking-widest mb-3"
                 style={{ color: "var(--color-text-subtle)" }}>
                Bienestar general — evolución
              </p>
              <PulseChart data={chartData} />
            </div>
          )}

          {/* Promedios con donuts */}
          {history.length >= 2 && (
            <div className="card">
              <p className="text-xs font-bold uppercase tracking-widest mb-4"
                 style={{ color: "var(--color-text-subtle)" }}>
                Promedios ({history.length} registros)
              </p>
              <div className="grid grid-cols-3 gap-3">
                <DonutChart
                  value={avgBienestar}
                  label="Bienestar"
                  color={avgBienestar >= 65 ? "var(--color-risk-low)" : avgBienestar >= 40 ? "var(--color-risk-mid)" : "var(--color-risk-high)"}
                  size={84}
                />
                <DonutChart
                  value={avgConcentracion}
                  label="Concentración"
                  color="var(--color-primary)"
                  size={84}
                />
                <DonutChart
                  value={avgCapacidad}
                  label="Energía"
                  color={avgCapacidad >= 60 ? "var(--color-risk-low)" : avgCapacidad >= 30 ? "var(--color-risk-mid)" : "var(--color-risk-high)"}
                  size={84}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
                <DonutChart
                  value={avgEstres}
                  label="Estrés prom."
                  sublabel="menos = mejor"
                  color={avgEstres >= 65 ? "var(--color-risk-high)" : avgEstres >= 40 ? "var(--color-risk-mid)" : "var(--color-risk-low)"}
                  size={76}
                />
                <DonutChart
                  value={avgCarga}
                  label="Carga prom."
                  sublabel="menos = mejor"
                  color={avgCarga >= 65 ? "var(--color-risk-high)" : avgCarga >= 40 ? "var(--color-risk-mid)" : "var(--color-risk-low)"}
                  size={76}
                />
              </div>
            </div>
          )}

          {/* Timeline de registros */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3"
               style={{ color: "var(--color-text-subtle)" }}>
              Registros
            </p>
            <div className="space-y-3">
              {history.map((h, idx) => {
                const prev  = history[idx + 1];
                const delta = prev ? h.indice_pulso - prev.indice_pulso : null;
                const rColor = RIESGO_COLOR[h.nivel_riesgo];
                const rBg    = RIESGO_BG[h.nivel_riesgo];

                return (
                  <div key={h.id} className="card p-0 overflow-hidden">
                    {/* Cabecera coloreada */}
                    <div className="flex items-center justify-between px-4 py-2.5"
                         style={{ background: rBg }}>
                      <div>
                        <p className="font-semibold text-sm capitalize" style={{ color: "var(--color-text)" }}>
                          {formatFecha(h.fecha)}
                        </p>
                        {delta !== null && (
                          <p className="text-xs"
                             style={{ color: delta >= 0 ? "var(--color-risk-low)" : "var(--color-risk-high)" }}>
                            {delta >= 0 ? `↑ +${delta}` : `↓ ${delta}`} vs. registro anterior
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
                           style={{ background: "rgba(255,255,255,0.55)" }}>
                        <span style={{ fontSize: 11, color: rColor, fontWeight: 700 }}>
                          {TENDENCIA_ICON[h.tendencia]}
                        </span>
                        <span style={{ fontSize: 11, color: rColor, fontWeight: 700, textTransform: "capitalize" }}>
                          {h.nivel_riesgo}
                        </span>
                      </div>
                    </div>

                    {/* Barras de métricas */}
                    <div className="px-4 py-3 space-y-2">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <MiniBar label="Bienestar"     value={h.indice_pulso} />
                        <MiniBar label="Concentración" value={h.concentracion} />
                        <MiniBar label="Estrés"        value={h.estres}        inverted />
                        <MiniBar label="Energía"       value={h.capacidad_restante} />
                      </div>

                      {/* Señales detectadas como chips */}
                      {h.detectados && h.detectados.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2"
                             style={{ borderTop: "1px solid var(--color-border)" }}>
                          {h.detectados.map((d, i) => (
                            <span
                              key={i}
                              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px]"
                              style={{
                                background: "var(--color-bg)",
                                color: "var(--color-text-muted)",
                                border: "1px solid var(--color-border)",
                              }}
                            >
                              {d.icono} {d.texto.length > 38 ? d.texto.slice(0, 38) + "…" : d.texto}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
