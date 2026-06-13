import Link from "next/link";
import { BackButton } from "@/components/ui/BackButton";
import { CAUSAS } from "@/lib/causas";
import type { CausaKey } from "@/lib/mock-analysis";
import { relativeDia } from "@/lib/fecha";

export type AnalisisRow = {
  fecha: string;
  indice_pulso: number;
  capacidad_restante: number;
  nivel_riesgo: "bajo" | "medio" | "alto";
  tendencia: "subiendo" | "estable" | "bajando";
  causa_principal: string | null;
  detectados: { icono: string; texto: string }[] | null;
};

const RISK = {
  bajo: { label: "Riesgo bajo", color: "#2d7a4e", bg: "#dcfce7", dot: "#2d7a4e", dotBg: "#dcfce7" },
  medio: { label: "Riesgo medio", color: "#b45309", bg: "#fef3c7", dot: "#d98c1a", dotBg: "#fef3c7" },
  alto: { label: "Riesgo alto", color: "#b91c1c", bg: "#fee2e2", dot: "#d83a3a", dotBg: "#fee2e2" },
};
const TEND_LABEL = { subiendo: "Subiendo", estable: "Estable", bajando: "Bajando" };

/** Pantalla de resultado de un Análisis (último o detalle del historial). */
export function AnalisisResult({
  analysis,
  backHref,
  ctaHref,
  ctaLabel,
}: {
  analysis: AnalisisRow;
  backHref: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  const rk = RISK[analysis.nivel_riesgo] ?? RISK.medio;
  const r = 88;
  const circ = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, analysis.indice_pulso)) / 100) * circ;

  const causaLabel = analysis.causa_principal && CAUSAS[analysis.causa_principal as CausaKey]
    ? CAUSAS[analysis.causa_principal as CausaKey].label
    : "-";
  const tendencia = TEND_LABEL[analysis.tendencia] ?? "Estable";

  const narrativa = (analysis.detectados ?? []).map((d) => d.texto).join(" ").trim()
    || "Registré tu día. Seguí cuidando tus pausas y tu descanso.";

  const dots: { key: "bajo" | "medio" | "alto"; label: string }[] = [
    { key: "bajo", label: "Bajo" },
    { key: "medio", label: "Medio" },
    { key: "alto", label: "Alto" },
  ];

  return (
    <div style={{ padding: "74px 22px 30px", animation: "screenIn .35s ease" }}>
      <BackButton href={backHref} />

      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--color-text-subtle)", fontWeight: 600 }}>
          Tu día, analizado · {relativeDia(analysis.fecha)}
        </div>
      </div>

      {/* Dona + semáforo */}
      <div className="flex flex-col items-center" style={{ margin: "14px 0 6px" }}>
        <div style={{ position: "relative", width: 212, height: 212 }}>
          <svg width="212" height="212" viewBox="0 0 212 212">
            <circle cx="106" cy="106" r={r} fill="none" stroke="var(--color-primary-light)" strokeWidth="16" />
            <circle cx="106" cy="106" r={r} fill="none" stroke={rk.color} strokeWidth="16" strokeLinecap="round" strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`} transform="rotate(-90 106 106)" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 13, letterSpacing: ".04em", color: "var(--color-text-subtle)", fontWeight: 600 }}>Índice de Pulso</div>
            <div style={{ fontSize: 62, fontWeight: 700, lineHeight: 1, letterSpacing: "-.03em", color: rk.color }}>{analysis.indice_pulso}</div>
            <div style={{ fontSize: 12.5, color: "var(--color-text-subtle)", fontWeight: 500, marginTop: 2 }}>de 100</div>
          </div>
        </div>

        {/* Semáforo */}
        <div className="flex items-center" style={{ gap: 10, marginTop: 18 }}>
          {dots.map((d) => {
            const active = analysis.nivel_riesgo === d.key;
            const c = RISK[d.key];
            return (
              <div key={d.key} className="flex flex-col items-center" style={{ gap: 6 }}>
                <span style={active
                  ? { width: 22, height: 22, borderRadius: "50%", background: c.dot, boxShadow: `0 0 0 5px ${c.dotBg}` }
                  : { width: 18, height: 18, borderRadius: "50%", background: d.key === "bajo" ? "#cfe3d8" : d.key === "medio" ? "#ead9b8" : "#eecaca" }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-subtle)" }}>{d.label}</span>
              </div>
            );
          })}
        </div>

        {/* Pill riesgo */}
        <div className="inline-flex items-center" style={{ marginTop: 14, gap: 8, background: rk.bg, color: rk.color, padding: "8px 16px", borderRadius: 999, fontSize: 14, fontWeight: 700 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: rk.color }} />
          {rk.label} · {tendencia}
        </div>
      </div>

      {/* Lo que detecté */}
      <div style={{ background: "#fff", border: "1px solid var(--color-border)", borderRadius: 18, padding: 20, marginTop: 22 }}>
        <div className="flex items-center" style={{ gap: 8, marginBottom: 11 }}>
          <span className="flex items-center justify-center" style={{ width: 26, height: 26, borderRadius: 8, background: "var(--color-primary)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 12.5h4l1.5-3.5 2.6 7 1.6-3.5h4.3" /></svg>
          </span>
          <span style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--color-text-subtle)", fontWeight: 600 }}>Lo que detecté</span>
        </div>
        <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.55, color: "var(--color-text)" }}>{narrativa}</p>
        <div style={{ marginTop: 14, paddingTop: 13, borderTop: "1px solid #eef4f1", fontSize: 11.5, color: "var(--color-text-subtle)", fontStyle: "italic" }}>Generado por IA según tu estado y carga</div>
      </div>

      {/* Stats */}
      <div className="flex" style={{ gap: 10, marginTop: 14 }}>
        <Stat label="Causa" value={causaLabel} />
        <Stat label="Energía" value={`${analysis.capacidad_restante}%`} color={rk.color} />
        <Stat label="Tendencia" value={tendencia} />
      </div>

      <Link href="/medico/sugerencias" className="flex items-center justify-center" style={{ width: "100%", background: "var(--color-primary-light)", color: "var(--color-primary)", border: "none", borderRadius: 14, padding: 15, fontSize: 15, fontWeight: 600, marginTop: 18, gap: 8 }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.4c.7.7 1 1.4 1 2.6h6c0-1.2.3-1.9 1-2.6A6 6 0 0 0 12 3Z" /></svg>
        Ver consejos para hoy
      </Link>
      <Link href={ctaHref} className="flex items-center justify-center" style={{ width: "100%", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: 14, padding: 16, fontSize: 15.5, fontWeight: 600, marginTop: 10 }}>
        {ctaLabel}
      </Link>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ flex: 1, background: "#fff", border: "1px solid var(--color-border)", borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
      <div style={{ fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--color-text-subtle)", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 14.5, fontWeight: 700, marginTop: 5, color: color ?? "var(--color-text)" }}>{value}</div>
    </div>
  );
}
