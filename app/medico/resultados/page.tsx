import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { HeartPulseIcon, ClipboardIcon } from "@/components/ui/icons";
import { calcularTrayectoria } from "@/lib/trayectoria";
import { ResultadosClient } from "./ResultadosClient";

export default async function ResultadosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Último análisis (incluye sugerencias y detectados)
  const { data: latest } = await supabase
    .from("ai_analysis")
    .select("*")
    .eq("medico_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Penúltimo registro para comparación delta
  const { data: prevRows } = await supabase
    .from("ai_analysis")
    .select("indice_pulso, concentracion, capacidad_restante, estres, carga_acumulada")
    .eq("medico_id", user.id)
    .order("created_at", { ascending: false })
    .range(1, 1);
  const prev = prevRows?.[0] ?? null;

  // Últimos 7 registros para el gráfico de tendencia
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

  // Serie para proyección de trayectoria
  const { data: serieRows } = await supabase
    .from("ai_analysis")
    .select("indice_pulso, estres, carga_acumulada")
    .eq("medico_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8);
  const serie = (serieRows ?? [])
    .slice()
    .reverse()
    .map((r) => ({
      indicePulso: r.indice_pulso ?? 50,
      estres: r.estres ?? 50,
      cargaAcumulada: r.carga_acumulada ?? 50,
    }));
  const trayectoria = calcularTrayectoria(serie);

  // ── Cálculo de horas trabajadas ────────────────────────────────────────────
  function extraerHorasDelTexto(texto: string): number | null {
    if (!texto) return null;
    const t = texto.toLowerCase();
    const palabras: Record<string, number> = {
      "una": 1, "un": 1, "dos": 2, "tres": 3, "cuatro": 4, "cinco": 5,
      "seis": 6, "siete": 7, "ocho": 8, "nueve": 9, "diez": 10,
      "once": 11, "doce": 12, "trece": 13, "catorce": 14, "quince": 15,
      "dieciséis": 16, "dieciseis": 16, "diecisiete": 17, "dieciocho": 18,
      "diecinueve": 19, "veinte": 20,
    };
    const resultados: number[] = [];
    const numericRegex = /(\d{1,2})\s*(?:horas?|hs?\.?)\b/gi;
    let m;
    while ((m = numericRegex.exec(t)) !== null) {
      const n = parseInt(m[1], 10);
      if (n >= 1 && n <= 24) resultados.push(n);
    }
    for (const [palabra, valor] of Object.entries(palabras)) {
      if (new RegExp(`\\b${palabra}\\s+horas?\\b`, "i").test(t)) resultados.push(valor);
    }
    return resultados.length > 0 ? Math.max(...resultados) : null;
  }

  const today = new Date().toISOString().split("T")[0];
  const { data: shifts } = await supabase
    .from("extra_shifts")
    .select("fecha_inicio, fecha_fin")
    .eq("medico_asignado_id", user.id)
    .gte("fecha_inicio", today + "T00:00:00")
    .lte("fecha_fin", today + "T23:59:59");

  const horasCalendario = Math.round(
    8 + (shifts ?? []).reduce((sum, s) =>
      sum + (new Date(s.fecha_fin).getTime() - new Date(s.fecha_inicio).getTime()) / 3600000, 0)
  );
  const horasTranscripcion = extraerHorasDelTexto(checkin?.transcripcion_voz ?? "");
  const horasTrabajadas = horasTranscripcion !== null
    ? Math.max(horasCalendario, horasTranscripcion)
    : horasCalendario;
  const fuenteHoras = horasTranscripcion !== null && horasTranscripcion > horasCalendario
    ? `${horasTranscripcion}h (mencionadas)`
    : `${horasCalendario}h (calendario)`;
  // ───────────────────────────────────────────────────────────────────────────

  const chartData = (history ?? []).map((h) => ({
    label: new Date(h.fecha + "T00:00:00").toLocaleDateString("es-AR", { weekday: "short" }),
    value: h.indice_pulso ?? 50,
  }));

  return (
    <div className="px-5 py-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
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
        <ResultadosClient
          latest={latest as Record<string, unknown>}
          prev={prev as Record<string, unknown> | null}
          chartData={chartData}
          horasTrabajadas={horasTrabajadas}
          fuenteHoras={fuenteHoras}
          trayectoria={trayectoria}
        />
      )}
    </div>
  );
}
