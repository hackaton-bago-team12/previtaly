import { AnalysisIcon } from "@/components/ui/analysis-icon";

export type Sugerencia = {
  tipo: "primaria" | "secundaria";
  titulo: string;
  descripcion: string;
  icono: string;
};

const FALLBACK_PRIMARY: Sugerencia = {
  tipo: "primaria",
  titulo: "Cortá 10 minutos antes de tu próxima guardia",
  descripcion: "Una pausa real, sin pantallas, baja el estrés acumulado y sostiene tu concentración el resto del día.",
  icono: "leaf",
};
const FALLBACK_SEC: Sugerencia[] = [
  { tipo: "secundaria", titulo: "Hidratación", descripcion: "Tomá un vaso de agua ahora y otro en 2 horas.", icono: "water" },
  { tipo: "secundaria", titulo: "Respiración 4-7-8", descripcion: "Tres ciclos antes de dormir para conciliar mejor.", icono: "breath" },
  { tipo: "secundaria", titulo: "Cena temprana", descripcion: "Comé al menos 2 horas antes de acostarte.", icono: "food" },
];

/** Tarjetas de consejos: acción primaria (verde) + secundarias (blancas). */
export function ConsejosCards({ sugerencias }: { sugerencias: Sugerencia[] }) {
  const primaria = sugerencias.find((s) => s.tipo === "primaria") ?? FALLBACK_PRIMARY;
  const secundarias = sugerencias.filter((s) => s.tipo === "secundaria");
  const secs = secundarias.length > 0 ? secundarias : FALLBACK_SEC;

  return (
    <>
      {/* Acción primaria */}
      <div style={{ background: "var(--color-primary)", borderRadius: 20, padding: 22, color: "#fff", marginBottom: 14, boxShadow: "0 14px 34px -16px rgba(45,82,70,.7)" }}>
        <div style={{ fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: "#a7c4b8", fontWeight: 600, marginBottom: 12 }}>Empezá por acá</div>
        <div className="flex items-start" style={{ gap: 14 }}>
          <span className="flex items-center justify-center" style={{ flex: "0 0 auto", width: 46, height: 46, borderRadius: 13, background: "rgba(255,255,255,.14)", color: "#fff" }}>
            <AnalysisIcon name={primaria.icono} className="h-6 w-6" />
          </span>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-.01em", lineHeight: 1.25 }}>{primaria.titulo}</div>
            <div style={{ fontSize: 14, color: "#cfe0d8", marginTop: 5, lineHeight: 1.45 }}>{primaria.descripcion}</div>
          </div>
        </div>
      </div>

      {/* Secundarias */}
      {secs.map((c, i) => (
        <div key={i} className="flex items-start" style={{ background: "#fff", border: "1px solid var(--color-border)", borderRadius: 16, padding: 16, marginBottom: 11, gap: 13 }}>
          <span className="flex items-center justify-center" style={{ flex: "0 0 auto", width: 40, height: 40, borderRadius: 12, background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
            <AnalysisIcon name={c.icono} className="h-5 w-5" />
          </span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)" }}>{c.titulo}</div>
            <div style={{ fontSize: 13.5, color: "var(--color-text-muted)", marginTop: 3, lineHeight: 1.4 }}>{c.descripcion}</div>
          </div>
        </div>
      ))}
    </>
  );
}

/** Banner de seguimiento sugerido cuando el riesgo viene medio/alto. */
export function SeguimientoBanner() {
  return (
    <div className="flex items-start" style={{ background: "var(--color-risk-mid-bg)", border: "1px solid #f5e3a8", borderRadius: 16, padding: 16, marginTop: 6, gap: 12 }}>
      <span style={{ flex: "0 0 auto", color: "#b45309", marginTop: 1 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01M10.3 4.3 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" /></svg>
      </span>
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: "#92400e" }}>Seguimiento sugerido</div>
        <div style={{ fontSize: 13, color: "#92400e", marginTop: 3, lineHeight: 1.45 }}>
          Tu carga viene alta. Volvé a hacer un check-in mañana, no es una señal de debilidad; es parte del protocolo de cuidado.
        </div>
      </div>
    </div>
  );
}
