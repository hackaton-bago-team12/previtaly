import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

/** Calcula la racha de días consecutivos con check-in terminando hoy o ayer. */
function calcularRacha(fechas: string[]): number {
  const set = new Set(fechas);
  const hoy = new Date();
  const iso = (d: Date) => d.toISOString().split("T")[0];

  // El último check-in debe ser hoy o ayer para que la racha esté "viva".
  const ayer = new Date(hoy);
  ayer.setDate(hoy.getDate() - 1);
  const cursor = set.has(iso(hoy)) ? new Date(hoy) : set.has(iso(ayer)) ? ayer : null;
  if (!cursor) return 0;

  let racha = 0;
  while (set.has(iso(cursor))) {
    racha++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return racha;
}

export default async function MedicoHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const firstName = profile?.full_name?.replace(/^Dr[a]?\.?\s*/i, "").split(" ")[0] ?? "Doctor";

  const { data: checkins } = await supabase
    .from("daily_checkins")
    .select("fecha")
    .eq("medico_id", user.id)
    .order("fecha", { ascending: false })
    .limit(60);

  const racha = calcularRacha((checkins ?? []).map((c) => c.fecha as string));

  const hoy = new Date();
  const fechaLabel = hoy
    .toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })
    .replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div style={{ padding: "18px 22px 24px", animation: "screenIn .35s ease" }}>
      {/* Header marca */}
      <div className="flex items-center gap-[9px]" style={{ marginBottom: 30 }}>
        <div className="flex items-center justify-center" style={{ width: 30, height: 30, borderRadius: 9, background: "var(--color-primary)" }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 12.5h4l1.5-3.5 2.6 7 1.6-3.5h4.3" /></svg>
        </div>
        <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-.02em", color: "var(--color-text)" }}>Preva</span>
      </div>

      {/* Saludo */}
      <p style={{ margin: 0, fontSize: 13, letterSpacing: ".02em", color: "var(--color-text-subtle)", fontWeight: 500 }}>{fechaLabel}</p>
      <h1 style={{ margin: "6px 0 2px", fontSize: 27, fontWeight: 700, letterSpacing: "-.02em", color: "var(--color-text)" }}>Hola, Dr. {firstName}</h1>
      <p style={{ margin: "0 0 26px", fontSize: 16, color: "var(--color-text-muted)" }}>¿Qué quieres hacer hoy?</p>

      {/* Tarjeta · Análisis del Día */}
      <Link href="/medico/analisis" className="flex items-center gap-4" style={cardStyle}>
        <span className="flex items-center justify-center" style={iconBox}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 6a4.6 4.6 0 0 0-8.8-1.2A4.6 4.6 0 0 0 3.2 6c-1.5 2.5-.5 5.7 2.3 8.5 1.6 1.5 3.9 3.4 6.5 5.4 2.6-2 4.9-3.9 6.5-5.4 2.8-2.8 3.8-6 2.3-8.5Z" /><path d="M4 12h3.4l1.4-2.8 2.4 5.6 1.4-2.8H16" /></svg>
        </span>
        <span className="flex-1 min-w-0">
          <span style={{ display: "block", fontSize: 17, fontWeight: 700, letterSpacing: "-.01em", color: "var(--color-text)" }}>Análisis del Día</span>
          <span style={{ display: "block", fontSize: 13.5, color: "var(--color-text-muted)", marginTop: 3, lineHeight: 1.35 }}>Cuéntame cómo estuvo tu día y lo analizo</span>
        </span>
        <Chevron />
      </Link>

      {/* Tarjeta · Consejería del Día */}
      <Link href="/medico/consejeria" className="flex items-center gap-4" style={{ ...cardStyle, marginBottom: 0 }}>
        <span className="flex items-center justify-center" style={iconBox}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 0 0-4 10.4c.7.7 1 1.4 1 2.6h6c0-1.2.3-1.9 1-2.6A6 6 0 0 0 12 3Z" /></svg>
        </span>
        <span className="flex-1 min-w-0">
          <span style={{ display: "block", fontSize: 17, fontWeight: 700, letterSpacing: "-.01em", color: "var(--color-text)" }}>Consejería del Día</span>
          <span style={{ display: "block", fontSize: 13.5, color: "var(--color-text-muted)", marginTop: 3, lineHeight: 1.35 }}>Recomendaciones según tu jornada</span>
        </span>
        <Chevron />
      </Link>

      {/* Racha */}
      {racha > 0 && (
        <div className="flex items-center gap-[14px]" style={{ marginTop: 26, background: "var(--color-primary-light)", borderRadius: 18, padding: "18px 20px" }}>
          <span className="flex items-center justify-center" style={{ width: 42, height: 42, borderRadius: "50%", background: "#fff", color: "var(--color-risk-low)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5" /><path d="M8.5 12l2.5 2.5 4.5-5" /></svg>
          </span>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text)" }}>
              Llevas {racha} {racha === 1 ? "día" : "días"} seguidos
            </div>
            <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 1 }}>Tu constancia mejora la precisión del análisis</div>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  width: "100%",
  background: "#fff",
  border: "1px solid var(--color-border)",
  borderRadius: 20,
  padding: 22,
  marginBottom: 14,
  boxShadow: "0 6px 20px -12px rgba(26,46,38,.3)",
};

const iconBox: React.CSSProperties = {
  flex: "0 0 auto",
  width: 54,
  height: 54,
  borderRadius: 16,
  background: "var(--color-primary-light)",
  color: "var(--color-primary)",
};

function Chevron() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
  );
}
