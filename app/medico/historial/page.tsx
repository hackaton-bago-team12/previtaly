import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { relativeDia } from "@/lib/fecha";

type Row = {
  id: string;
  fecha: string;
  tipo?: string | null;
  indice_pulso: number;
  nivel_riesgo: "bajo" | "medio" | "alto";
  detectados: { icono: string; texto: string }[] | null;
  sugerencias: { tipo: string }[] | null;
  daily_checkins?: { modo: string | null } | null;
};

const RISK_ACCENT = { bajo: "#2d7a4e", medio: "#d98c1a", alto: "#d83a3a" };
const TIPO_STYLE = {
  analisis: { label: "Análisis", col: "#2d5246", bg: "#e8f0ec" },
  consejeria: { label: "Consejería", col: "#7a5cc4", bg: "#efeaf9" },
};
const FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "analisis", label: "Análisis" },
  { key: "consejeria", label: "Consejería" },
];

/** Genera el path de la línea de evolución a partir de los índices (viejo→nuevo). */
function buildChart(values: number[]) {
  if (values.length < 2) return null;
  const W = 300, H = 86, top = 10, bot = 74;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = bot - (Math.max(0, Math.min(100, v)) / 100) * (bot - top);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(0)} ${y.toFixed(0)}`).join(" ");
  const area = `${line} L${W} ${H} L0 ${H} Z`;
  const last = pts[pts.length - 1];
  return { line, area, lastX: last[0], lastY: last[1] };
}

function resumenDe(r: Row): string {
  if ((r.tipo ?? "analisis") === "consejeria") {
    const n = (r.sugerencias ?? []).length || 3;
    return `${n} recomendaciones para tu jornada.`;
  }
  return r.detectados?.[0]?.texto || "Análisis de tu día.";
}

export default async function HistorialPage({
  searchParams,
}: {
  searchParams: Promise<{ f?: string }>;
}) {
  const { f } = await searchParams;
  const filter = ["analisis", "consejeria"].includes(f ?? "") ? (f as string) : "todos";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // select('*') con join: resiliente si la columna `tipo` aún no existe.
  const { data } = await supabase
    .from("ai_analysis")
    .select("*, daily_checkins(modo)")
    .eq("medico_id", user.id)
    .order("fecha", { ascending: false })
    .limit(30);

  const rows = (data ?? []) as unknown as Row[];
  const tipoDe = (r: Row) => (r.tipo === "consejeria" ? "consejeria" : "analisis");

  const filtradas = rows.filter((r) => filter === "todos" || tipoDe(r) === filter);

  const analisisAsc = rows.filter((r) => tipoDe(r) === "analisis").slice().reverse();
  const indices = analisisAsc.map((r) => r.indice_pulso).slice(-7);
  const chart = buildChart(indices);
  const prom = indices.length ? Math.round(indices.reduce((a, b) => a + b, 0) / indices.length) : 0;

  return (
    <div style={{ padding: "18px 22px 24px", animation: "screenIn .35s ease" }}>
      <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--color-text-subtle)", fontWeight: 600 }}>Últimos 30 días</div>
      <h1 style={{ margin: "8px 0 16px", fontSize: 25, fontWeight: 700, letterSpacing: "-.02em", color: "var(--color-text)" }}>Historial</h1>

      {/* Evolución */}
      {chart && (
        <div style={{ background: "#fff", border: "1px solid var(--color-border)", borderRadius: 16, padding: "18px 16px 10px", marginBottom: 18 }}>
          <div className="flex items-baseline justify-between" style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 600 }}>Evolución del Índice</span>
            <span style={{ fontSize: 13, color: "var(--color-text-subtle)" }}>prom. <strong style={{ color: "var(--color-primary)" }}>{prom}</strong></span>
          </div>
          <svg width="100%" height="86" viewBox="0 0 300 86" preserveAspectRatio="none">
            <defs>
              <linearGradient id="ph" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2d5246" stopOpacity=".22" />
                <stop offset="1" stopColor="#2d5246" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={chart.area} fill="url(#ph)" />
            <path d={chart.line} fill="none" stroke="#2d5246" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={chart.lastX} cy={chart.lastY} r="4" fill="#2d5246" />
          </svg>
        </div>
      )}

      {/* Filtros */}
      <div className="flex" style={{ gap: 8, marginBottom: 16 }}>
        {FILTERS.map((ft) => {
          const active = filter === ft.key;
          return (
            <Link
              key={ft.key}
              href={ft.key === "todos" ? "/medico/historial" : `/medico/historial?f=${ft.key}`}
              className="flex-1 text-center"
              style={{ padding: 9, borderRadius: 11, border: "1px solid var(--color-border)", fontSize: 13, fontWeight: 600, color: active ? "var(--color-primary)" : "var(--color-text-muted)", background: active ? "var(--color-primary-light)" : "#fff" }}
            >
              {ft.label}
            </Link>
          );
        })}
      </div>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div className="card text-center" style={{ paddingTop: 36, paddingBottom: 36 }}>
          <p className="font-semibold" style={{ color: "var(--color-text)", marginBottom: 4 }}>Sin registros todavía</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)", marginBottom: 18 }}>Hacé tu primer análisis o consejería del día.</p>
          <Link href="/medico" className="btn-primary inline-block w-auto" style={{ paddingLeft: 24, paddingRight: 24 }}>Ir al inicio →</Link>
        </div>
      ) : (
        filtradas.map((r) => {
          const tipo = tipoDe(r);
          const ts = TIPO_STYLE[tipo];
          const accent = tipo === "consejeria" ? "#b6a3e0" : RISK_ACCENT[r.nivel_riesgo] ?? "#d98c1a";
          const riskCol = tipo === "consejeria" ? "#7a5cc4" : RISK_ACCENT[r.nivel_riesgo] ?? "#d98c1a";
          const express = r.daily_checkins?.modo === "express";
          return (
            <Link key={r.id} href={`/medico/historial/${r.id}`} className="block" style={{ background: "#fff", border: "1px solid var(--color-border)", borderRadius: 16, marginBottom: 11, overflow: "hidden" }}>
              <div style={{ height: 5, background: accent }} />
              <div className="flex items-center" style={{ padding: "14px 16px", gap: 13 }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center" style={{ gap: 7, marginBottom: 5, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)" }}>{relativeDia(r.fecha)}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: ts.col, background: ts.bg, padding: "2px 8px", borderRadius: 999 }}>{ts.label}</span>
                    {express && <span style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-muted)", background: "#eef4f1", padding: "2px 8px", borderRadius: 999 }}>Express</span>}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.4 }}>{resumenDe(r)}</div>
                </div>
                {tipo === "analisis" ? (
                  <div style={{ flex: "0 0 auto", textAlign: "center" }}>
                    <div style={{ fontSize: 23, fontWeight: 700, lineHeight: 1, color: riskCol }}>{r.indice_pulso}</div>
                    <div style={{ fontSize: 9.5, color: "var(--color-text-subtle)", fontWeight: 600, marginTop: 2 }}>índice</div>
                  </div>
                ) : (
                  <span style={{ flex: "0 0 auto", color: "var(--color-primary)" }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.4c.7.7 1 1.4 1 2.6h6c0-1.2.3-1.9 1-2.6A6 6 0 0 0 12 3Z" /></svg>
                  </span>
                )}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-soft)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}
