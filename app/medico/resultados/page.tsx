import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { PulseChart, DonutChart, PerformanceCurveChart } from "@/components/ui/PulseChart";
import { HeartPulseIcon, ClipboardIcon } from "@/components/ui/icons";
import { AnalysisIcon } from "@/components/ui/analysis-icon";
import { CAUSAS } from "@/lib/causas";
import type { CausaKey, Factor } from "@/lib/mock-analysis";

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

  // Penúltimo registro para comparación
  const { data: prevRows } = await supabase
    .from("ai_analysis")
    .select("indice_pulso, concentracion, capacidad_restante, estres, carga_acumulada")
    .eq("medico_id", user.id)
    .order("created_at", { ascending: false })
    .range(1, 1);
  const prev = prevRows?.[0] ?? null;

  // Historial (últimos 7 registros para el gráfico de línea)
  const { data: history } = await supabase
    .from("ai_analysis")
    .select("fecha, indice_pulso")
    .eq("medico_id", user.id)
    .order("fecha", { ascending: true })
    .limit(7);

  // Transcripción del último check-in (para detectar horas mencionadas)
  const { data: checkin } = await supabase
    .from("daily_checkins")
    .select("transcripcion_voz")
    .eq("id", latest?.checkin_id)
    .maybeSingle();

  const transcripcion = checkin?.transcripcion_voz ?? "";

  /** Extrae la mayor cantidad de horas mencionada en el texto.
   *  Detecta patrones como "16 horas", "trabajé 12h", "doce horas", etc. */
  function extraerHorasDelTexto(texto: string): number | null {
    if (!texto) return null;
    const t = texto.toLowerCase();

    // Números en palabras (español)
    const palabras: Record<string, number> = {
      "una": 1, "un": 1, "dos": 2, "tres": 3, "cuatro": 4, "cinco": 5,
      "seis": 6, "siete": 7, "ocho": 8, "nueve": 9, "diez": 10,
      "once": 11, "doce": 12, "trece": 13, "catorce": 14, "quince": 15,
      "dieciséis": 16, "dieciseis": 16, "diecisiete": 17, "dieciocho": 18,
      "diecinueve": 19, "veinte": 20,
    };

    const resultados: number[] = [];

    // Patrones numéricos: "16 horas", "16h", "16hs"
    const numericRegex = /(\d{1,2})\s*(?:horas?|hs?\.?)\b/gi;
    let m;
    while ((m = numericRegex.exec(t)) !== null) {
      const n = parseInt(m[1], 10);
      if (n >= 1 && n <= 24) resultados.push(n);
    }

    // Patrones en palabras: "doce horas", "catorce horas"
    for (const [palabra, valor] of Object.entries(palabras)) {
      const regex = new RegExp(`\\b${palabra}\\s+horas?\\b`, "i");
      if (regex.test(t)) resultados.push(valor);
    }

    return resultados.length > 0 ? Math.max(...resultados) : null;
  }

  // Horas trabajadas hoy desde el calendario (extra_shifts)
  const today = new Date().toISOString().split("T")[0];
  const { data: shifts } = await supabase
    .from("extra_shifts")
    .select("fecha_inicio, fecha_fin")
    .eq("medico_asignado_id", user.id)
    .gte("fecha_inicio", today + "T00:00:00")
    .lte("fecha_fin", today + "T23:59:59");

  const horasCalendario = Math.round(
    8 + (shifts ?? []).reduce((sum, s) => {
      return sum + (new Date(s.fecha_fin).getTime() - new Date(s.fecha_inicio).getTime()) / 3600000;
    }, 0)
  );

  const horasTranscripcion = extraerHorasDelTexto(transcripcion);

  // Prevalece el mayor valor entre lo mencionado y el calendario
  const horasTrabajadas = horasTranscripcion !== null
    ? Math.max(horasCalendario, horasTranscripcion)
    : horasCalendario;

  const fuenteHoras = horasTranscripcion !== null && horasTranscripcion > horasCalendario
    ? `${horasTranscripcion}h (mencionadas)`
    : `${horasCalendario}h (calendario)`;

  const chartData = (history ?? []).map((h) => ({
    label: new Date(h.fecha + "T00:00:00").toLocaleDateString("es-AR", { weekday: "short" }),
    value: h.indice_pulso ?? 50,
  }));

  const detectados = latest?.detectados as { icono: string; texto: string }[] | null;

  const delta = (key: "indice_pulso" | "concentracion" | "capacidad_restante" | "estres" | "carga_acumulada") =>
    prev && latest ? latest[key] - prev[key] : undefined;

  return (
    <div className="px-5 py-8 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <HeartPulseIcon className="h-5 w-5" style={{ color: "var(--color-primary)" } as React.CSSProperties} />
        <span className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>Tu día, analizado</span>
      </div>

      {!latest ? (
        <div className="card text-center py-12">
          <ClipboardIcon className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--color-text-subtle)" }} />
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

          {/* Causa principal — el "por qué" detrás del riesgo */}
          {latest.causa_principal && CAUSAS[latest.causa_principal as CausaKey] && (() => {
            const causa = CAUSAS[latest.causa_principal as CausaKey];
            const factores = (latest.factores as Factor[] | null) ?? [];
            const Icon = causa.Icon;
            return (
              <div className="card">
                <p className="text-xs font-bold uppercase tracking-widest mb-3"
                   style={{ color: "var(--color-text-subtle)" }}>
                  Causa principal
                </p>
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                       style={{ background: "var(--color-primary-lt)" }}>
                    <Icon className="h-6 w-6" style={{ color: "var(--color-primary)" }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: "var(--color-text)" }}>{causa.label}</p>
                    <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>{causa.descripcion}</p>
                  </div>
                </div>

                {factores.length > 0 && (
                  <div className="mt-4 space-y-2.5">
                    {factores.map((f) => {
                      const info = CAUSAS[f.dimension];
                      if (!info) return null;
                      return (
                        <div key={f.dimension}>
                          <div className="flex justify-between text-xs mb-1">
                            <span style={{ color: "var(--color-text-muted)" }}>{info.label}</span>
                            <span className="font-semibold" style={{ color: "var(--color-text)" }}>{f.peso}%</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
                            <div className="h-full rounded-full"
                                 style={{ width: `${f.peso}%`, background: "var(--color-primary)" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Donuts — métricas principales */}
          <div className="card">
            <p className="text-xs font-bold uppercase tracking-widest mb-1"
               style={{ color: "var(--color-text-subtle)" }}>
              Métricas del día
              {prev && <span className="ml-2 normal-case font-normal">(vs. ayer)</span>}
            </p>
            <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>
              Los valores son de 0 a 100. En Estrés y Carga, menos es mejor.
            </p>

            {/* Fila 1: las 3 métricas "positivas" más importantes */}
            <div className="grid grid-cols-3 gap-3">
              <DonutChart
                value={latest.capacidad_restante}
                label="Energía"
                sublabel="restante"
                color={latest.capacidad_restante >= 60 ? "var(--color-risk-low)" :
                       latest.capacidad_restante >= 30 ? "var(--color-risk-mid)" : "var(--color-risk-high)"}
                size={96}
                delta={delta("capacidad_restante")}
              />
              <DonutChart
                value={latest.concentracion}
                label="Concentración"
                sublabel="foco mental"
                color="var(--color-primary)"
                size={96}
                delta={delta("concentracion")}
              />
              <DonutChart
                value={latest.indice_pulso}
                label="Bienestar"
                sublabel="estado general"
                color={latest.indice_pulso >= 70 ? "var(--color-risk-low)" :
                       latest.indice_pulso >= 45 ? "var(--color-risk-mid)" : "var(--color-risk-high)"}
                size={96}
                delta={delta("indice_pulso")}
              />
            </div>

            {/* Fila 2: métricas de carga (invertidas — menos es mejor) */}
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4"
                 style={{ borderTop: "1px solid var(--color-border)" }}>
              <DonutChart
                value={latest.estres}
                label="Estrés"
                sublabel="menos es mejor"
                color={latest.estres >= 70 ? "var(--color-risk-high)" :
                       latest.estres >= 40 ? "var(--color-risk-mid)" : "var(--color-risk-low)"}
                size={84}
                delta={delta("estres") !== undefined ? -(delta("estres")!) : undefined}
              />
              <DonutChart
                value={latest.carga_acumulada}
                label="Carga acumulada"
                sublabel="menos es mejor"
                color={latest.carga_acumulada >= 70 ? "var(--color-risk-high)" :
                       latest.carga_acumulada >= 40 ? "var(--color-risk-mid)" : "var(--color-risk-low)"}
                size={84}
                delta={delta("carga_acumulada") !== undefined ? -(delta("carga_acumulada")!) : undefined}
              />
            </div>
          </div>

          {/* Curva de rendimiento vs horas trabajadas */}
          <div className="card">
            <p className="text-xs font-bold uppercase tracking-widest mb-1"
               style={{ color: "var(--color-text-subtle)" }}>
              Rendimiento vs. horas trabajadas
            </p>
            <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
              Jornada estimada: <strong>{horasTrabajadas}h</strong>
              <span style={{ color: "var(--color-text-subtle)" }}> · {fuenteHoras}</span>.{" "}
              El punto muestra tu desempeño en relación a la curva esperada.
            </p>
            <PerformanceCurveChart
              horasTrabajadas={horasTrabajadas}
              indicePulso={latest.indice_pulso}
              concentracion={latest.concentracion}
              capacidadRestante={latest.capacidad_restante}
            />
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
                    <AnalysisIcon name={d.icono} className="h-5 w-5 flex-shrink-0" style={{ color: "var(--color-primary)" }} />
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{d.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gráfico de tendencia */}
          {chartData.length >= 2 && (
            <div className="card">
              <h3 className="font-bold mb-1" style={{ color: "var(--color-text)" }}>
                Tendencia — Bienestar general
              </h3>
              <p className="text-xs mb-4" style={{ color: "var(--color-text-subtle)" }}>
                Últimos {chartData.length} registros
              </p>
              <PulseChart data={chartData} />
            </div>
          )}

          {/* CTAs */}
          <Link href="/medico/sugerencias" className="btn-primary block text-center">
            Ver plan de hoy →
          </Link>
          <Link href="/medico/historial"
                className="block text-center text-sm underline underline-offset-2"
                style={{ color: "var(--color-text-subtle)" }}>
            Ver historial completo
          </Link>
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
