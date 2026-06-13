import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LightbulbIcon } from "@/components/ui/icons";

type AnalysisRow = {
  medico_id: string;
  nivel_riesgo: string;
  indice_pulso: number;
  estres: number;
  capacidad_restante: number;
  sugerencias: { tipo: string; titulo: string; descripcion: string; icono: string }[];
};

type MedicoMap = Record<string, { full_name: string | null; specialty: string | null }>;

export default async function SugerenciasAnalistaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: analistaProfile } = await supabase
    .from("profiles")
    .select("clinic_id")
    .eq("id", user.id)
    .maybeSingle();

  const clinicId = analistaProfile?.clinic_id;

  const { data: medicos } = await supabase
    .from("profiles")
    .select("id, full_name, specialty")
    .eq("clinic_id", clinicId)
    .eq("role", "medico");

  const medicoMap: MedicoMap = Object.fromEntries(
    (medicos ?? []).map((m) => [m.id, { full_name: m.full_name, specialty: m.specialty }])
  );

  // Último análisis por médico
  const latestAnalyses: AnalysisRow[] = [];
  for (const m of medicos ?? []) {
    const { data } = await supabase
      .from("ai_analysis")
      .select("medico_id, nivel_riesgo, indice_pulso, estres, capacidad_restante, sugerencias")
      .eq("medico_id", m.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) latestAnalyses.push(data as AnalysisRow);
  }

  const highRiskMedicos = latestAnalyses.filter((a) => a.nivel_riesgo === "alto");
  const midRiskMedicos  = latestAnalyses.filter((a) => a.nivel_riesgo === "medio");
  const totalMedicos    = (medicos ?? []).length;
  const withData        = latestAnalyses.length;
  const avgPulse        = withData
    ? Math.round(latestAnalyses.reduce((s, a) => s + a.indice_pulso, 0) / withData)
    : null;
  const avgStress       = withData
    ? Math.round(latestAnalyses.reduce((s, a) => s + a.estres, 0) / withData)
    : null;

  // Generar conclusiones clínicas
  const conclusiones: { tipo: "critica" | "atencion" | "positiva"; texto: string }[] = [];
  if (highRiskMedicos.length > 0) {
    conclusiones.push({
      tipo: "critica",
      texto: `${highRiskMedicos.length} médico${highRiskMedicos.length > 1 ? "s" : ""} en riesgo alto: ${highRiskMedicos.map((a) => medicoMap[a.medico_id]?.full_name?.split(" ").pop() ?? "—").join(", ")}.`,
    });
  }
  if (avgStress !== null && avgStress > 60) {
    conclusiones.push({
      tipo: "atencion",
      texto: `El estrés promedio del equipo está en ${avgStress}%, por encima del umbral recomendado (60%).`,
    });
  }
  if (midRiskMedicos.length > totalMedicos / 2) {
    conclusiones.push({
      tipo: "atencion",
      texto: `Más de la mitad del equipo presenta carga media-alta. Evaluar redistribución de consultas.`,
    });
  }
  if (highRiskMedicos.length === 0 && midRiskMedicos.length === 0) {
    conclusiones.push({
      tipo: "positiva",
      texto: `El equipo está en buenas condiciones. Mantener las rutinas actuales.`,
    });
  }

  // Sugerencias de acción clínica
  const acciones = [
    ...(highRiskMedicos.length > 0
      ? [{ icono: "🧠", titulo: "Sesión de apoyo psicológico", descripcion: `Coordinar una evaluación para ${highRiskMedicos.length} médico${highRiskMedicos.length > 1 ? "s" : ""} en riesgo alto antes del próximo turno largo.`, urgencia: "alta" as const }]
      : []),
    ...(avgStress !== null && avgStress > 50
      ? [{ icono: "🧘", titulo: "Taller de manejo del estrés", descripcion: "Un taller grupal de 2 horas reduce la carga percibida del equipo hasta un 30%. Ideal fuera del horario de consultas.", urgencia: "media" as const }]
      : []),
    { icono: "📋", titulo: "Revisión de carga horaria", descripcion: "Analizar si la distribución de guardias es equitativa. Considerar rotar responsabilidades semanalmente.", urgencia: "media" as const },
    { icono: "💬", titulo: "Reunión de equipo quincenal", descripcion: "Espacio de 30 minutos sin agenda clínica para que el equipo exprese preocupaciones. Previene acumulación silenciosa.", urgencia: "baja" as const },
  ];

  const urgenciaConfig = {
    alta:  { label: "Urgente",   bg: "var(--color-risk-high-bg)", text: "var(--color-risk-high)" },
    media: { label: "Recomendado", bg: "var(--color-risk-mid-bg)", text: "var(--color-risk-mid)" },
    baja:  { label: "Preventivo", bg: "var(--color-primary-lt)",  text: "var(--color-primary)" },
  };

  return (
    <div className="px-5 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <LightbulbIcon className="h-5 w-5" style={{ color: "var(--color-primary)" } as React.CSSProperties} />
          <span className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
            Diagnóstico clínico
          </span>
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
          Estado de la clínica
        </h1>
      </div>

      {/* Métricas resumen */}
      {withData > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center">
            <p className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>{avgPulse}</p>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Índice de Pulso promedio</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold"
               style={{ color: (avgStress ?? 0) > 60 ? "var(--color-risk-high)" : "var(--color-risk-low)" }}>
              {avgStress}%
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Estrés promedio del equipo</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold" style={{ color: "var(--color-risk-high)" }}>
              {highRiskMedicos.length}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>En riesgo alto</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold" style={{ color: "var(--color-text)" }}>
              {withData}/{totalMedicos}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Con check-in hoy</p>
          </div>
        </div>
      )}

      {withData === 0 && (
        <div className="card text-center py-10">
          <p className="text-3xl mb-2">📊</p>
          <p className="font-medium" style={{ color: "var(--color-text)" }}>Sin datos aún</p>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Las conclusiones aparecen cuando los médicos realicen sus check-ins.
          </p>
        </div>
      )}

      {/* Conclusiones */}
      {conclusiones.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-3"
              style={{ color: "var(--color-text-subtle)" }}>
            Qué detectamos
          </h2>
          <div className="space-y-3">
            {conclusiones.map((c, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-2xl"
                   style={{
                     background: c.tipo === "critica" ? "var(--color-risk-high-bg)" :
                                 c.tipo === "atencion" ? "var(--color-risk-mid-bg)" :
                                 "var(--color-primary-lt)",
                   }}>
                <span className="text-xl flex-shrink-0">
                  {c.tipo === "critica" ? "🔴" : c.tipo === "atencion" ? "🟡" : "🟢"}
                </span>
                <p className="text-sm" style={{
                  color: c.tipo === "critica" ? "var(--color-risk-high)" :
                         c.tipo === "atencion" ? "var(--color-risk-mid)" :
                         "var(--color-primary)",
                }}>
                  {c.texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acciones sugeridas */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-3"
            style={{ color: "var(--color-text-subtle)" }}>
          Acciones sugeridas
        </h2>
        <div className="space-y-3">
          {acciones.map((a, i) => {
            const cfg = urgenciaConfig[a.urgencia];
            return (
              <div key={i} className="card flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                     style={{ background: cfg.bg }}>
                  {a.icono}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                      {a.titulo}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                          style={{ background: cfg.bg, color: cfg.text }}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {a.descripcion}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-center mt-4" style={{ color: "var(--color-text-subtle)" }}>
          + Generado por IA según el estado del equipo
        </p>
      </div>
    </div>
  );
}
