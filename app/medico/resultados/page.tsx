import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PulseChart } from "@/components/ui/PulseChart";
import { signOutMedico } from "../actions";
import { HeartPulseIcon, SignOutIcon } from "@/components/ui/icons";

export default async function ResultadosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Último análisis
  const { data: latest } = await supabase
    .from("ai_analysis")
    .select("*")
    .eq("medico_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Historial (últimos 7 registros para el gráfico)
  const { data: history } = await supabase
    .from("ai_analysis")
    .select("fecha, indice_pulso")
    .eq("medico_id", user.id)
    .order("fecha", { ascending: true })
    .limit(7);

  const chartData = (history ?? []).map((h) => ({
    label: new Date(h.fecha + "T00:00:00").toLocaleDateString("es-AR", { weekday: "short" }),
    value: h.indice_pulso ?? 50,
  }));

  const avg = chartData.length
    ? Math.round(chartData.reduce((s, d) => s + d.value, 0) / chartData.length)
    : null;

  const detectados = latest?.detectados as { icono: string; texto: string }[] | null;

  return (
    <div className="px-5 py-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartPulseIcon className="h-5 w-5" style={{ color: "var(--color-primary)" } as React.CSSProperties} />
          <span className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>Tu día, analizado</span>
        </div>
        <form action={signOutMedico}>
          <button type="submit" className="p-2 rounded-xl"
                  style={{ color: "var(--color-text-subtle)" }} aria-label="Cerrar sesión">
            <SignOutIcon className="h-5 w-5" />
          </button>
        </form>
      </div>

      {!latest ? (
        <div className="card text-center py-12">
          <p className="text-3xl mb-3">📋</p>
          <p className="font-semibold mb-1" style={{ color: "var(--color-text)" }}>
            Todavía no tenés análisis
          </p>
          <p className="text-sm mb-5" style={{ color: "var(--color-text-muted)" }}>
            Completá tu check-in diario para ver tus resultados aquí.
          </p>
          <Link href="/medico" className="btn-primary inline-block w-auto px-6">
            Hacer check-in →
          </Link>
        </div>
      ) : (
        <>
          {/* Risk card */}
          <RiskBadge
            nivel={latest.nivel_riesgo as "bajo" | "medio" | "alto"}
            tendencia={latest.tendencia as "subiendo" | "estable" | "bajando"}
            showTrafficLight
          />

          {/* Pulse index */}
          <div className="card">
            <div className="flex items-baseline justify-between mb-1">
              <p className="text-xs font-bold uppercase tracking-widest"
                 style={{ color: "var(--color-text-subtle)" }}>
                Índice de Pulso
              </p>
              {avg !== null && (
                <span className="text-xs" style={{ color: "var(--color-text-subtle)" }}>
                  ▲ {Math.abs(latest.indice_pulso - avg)} vs. tu media
                </span>
              )}
            </div>
            <p className="text-5xl font-bold mb-1"
               style={{ color: latest.indice_pulso >= 70 ? "var(--color-risk-low)" :
                               latest.indice_pulso >= 45 ? "var(--color-risk-mid)" :
                               "var(--color-risk-high)" }}>
              {latest.indice_pulso}
              <span className="text-xl font-normal" style={{ color: "var(--color-text-subtle)" }}>/100</span>
            </p>

            {chartData.length >= 2 && (
              <div className="mt-4">
                <PulseChart data={chartData} />
              </div>
            )}
          </div>

          {/* Qué detecté */}
          {detectados && detectados.length > 0 && (
            <div className="card">
              <h3 className="font-bold mb-3" style={{ color: "var(--color-text)" }}>
                Qué detecté
              </h3>
              <div className="space-y-3">
                {detectados.map((d, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                       style={{ background: "var(--color-bg)" }}>
                    <span className="text-xl flex-shrink-0">{d.icono}</span>
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{d.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Barras de métricas */}
          <div className="card">
            <h3 className="font-bold mb-4" style={{ color: "var(--color-text)" }}>
              Estado general
            </h3>
            <div className="space-y-4">
              <ProgressBar
                label="Carga"
                value={latest.carga_acumulada}
                maxLabel={latest.carga_acumulada >= 70 ? "Alta" : latest.carga_acumulada >= 40 ? "Media" : "Baja"}
              />
              <ProgressBar
                label="Estrés"
                value={latest.estres}
                maxLabel={latest.estres >= 70 ? "Alto" : latest.estres >= 40 ? "Medio" : "Bajo"}
              />
              <ProgressBar
                label="Descanso"
                value={100 - latest.carga_acumulada}
                maxLabel={latest.carga_acumulada <= 30 ? "Bueno" : latest.carga_acumulada <= 60 ? "Regular" : "Bajo"}
                color="green"
              />
              <ProgressBar
                label="Ánimo"
                value={latest.indice_pulso}
                maxLabel={latest.indice_pulso >= 70 ? "Bueno" : latest.indice_pulso >= 45 ? "Medio" : "Bajo"}
                color="primary"
              />
            </div>
          </div>

          {/* Métricas detalladas */}
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Concentración" value={`${latest.concentracion}%`} />
            <MetricCard label="Cap. restante" value={`${latest.capacidad_restante}%`} />
          </div>

          {/* Historial si hay más de 1 */}
          {chartData.length >= 3 && (
            <div className="card">
              <h3 className="font-bold mb-1" style={{ color: "var(--color-text)" }}>
                Historial — Índice de Pulso
              </h3>
              <p className="text-xs mb-4" style={{ color: "var(--color-text-subtle)" }}>
                Últimos {chartData.length} registros
              </p>
              <PulseChart data={chartData} />
            </div>
          )}

          {/* CTA sugerencias */}
          <Link href="/medico/sugerencias" className="btn-primary block text-center">
            Ver plan de hoy →
          </Link>

          {/* Nueva análisis */}
          <Link href="/medico"
                className="block text-center text-sm underline underline-offset-2 pb-2"
                style={{ color: "var(--color-text-subtle)" }}>
            Hacer nuevo check-in
          </Link>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <p className="text-xs font-medium mb-1" style={{ color: "var(--color-text-subtle)" }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>{value}</p>
    </div>
  );
}
