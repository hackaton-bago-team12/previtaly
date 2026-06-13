import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RiskChip } from "@/components/ui/RiskBadge";
import { SparkLine } from "@/components/ui/PulseChart";
import { signOutAnalista } from "./actions";
import { UsersIcon, SignOutIcon, AlertIcon } from "@/components/ui/icons";
import { CAUSAS } from "@/lib/causas";
import type { CausaKey } from "@/lib/mock-analysis";
import { pendiente } from "@/lib/trayectoria";

type MedicoRow = {
  id: string;
  full_name: string | null;
  specialty: string | null;
  latest_analysis?: {
    indice_pulso: number;
    nivel_riesgo: "bajo" | "medio" | "alto";
    fecha: string;
    tendencia: string;
    causa_principal: CausaKey | null;
  } | null;
  history: number[];
};

export default async function AnalistaHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Perfil del analista para obtener clinic_id
  const { data: analistaProfile } = await supabase
    .from("profiles")
    .select("clinic_id, full_name, clinics(name, code)")
    .eq("id", user.id)
    .maybeSingle();

  const clinicId   = analistaProfile?.clinic_id;
  const clinicInfo = analistaProfile?.clinics as unknown as { name: string; code: string } | null;
  const clinicName = clinicInfo?.name ?? "Mi Clínica";
  const clinicCode = clinicInfo?.code ?? "-";

  // Médicos de la misma clínica
  const { data: medicos } = await supabase
    .from("profiles")
    .select("id, full_name, specialty")
    .eq("clinic_id", clinicId)
    .eq("role", "medico");

  // Para cada médico, obtener su último análisis y los últimos 5 índices
  const medicoRows: MedicoRow[] = await Promise.all(
    (medicos ?? []).map(async (m) => {
      const { data: latest } = await supabase
        .from("ai_analysis")
        .select("indice_pulso, nivel_riesgo, fecha, tendencia, causa_principal")
        .eq("medico_id", m.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: historyRows } = await supabase
        .from("ai_analysis")
        .select("indice_pulso")
        .eq("medico_id", m.id)
        .order("fecha", { ascending: true })
        .limit(5);

      return {
        id: m.id,
        full_name: m.full_name,
        specialty: m.specialty,
        latest_analysis: latest,
        history: (historyRows ?? []).map((h) => h.indice_pulso ?? 50),
      };
    })
  );

  // Conteos de riesgo para el resumen
  const highRisk = medicoRows.filter((m) => m.latest_analysis?.nivel_riesgo === "alto").length;
  const midRisk  = medicoRows.filter((m) => m.latest_analysis?.nivel_riesgo === "medio").length;
  const noData   = medicoRows.filter((m) => !m.latest_analysis).length;

  // Por qué sube el equipo: ranking de causas principales del último check-in.
  const conCausa = medicoRows.filter((m) => m.latest_analysis?.causa_principal);
  const causaCounts = new Map<CausaKey, number>();
  for (const m of conCausa) {
    const c = m.latest_analysis!.causa_principal as CausaKey;
    causaCounts.set(c, (causaCounts.get(c) ?? 0) + 1);
  }
  const causasRanking = [...causaCounts.entries()]
    .map(([dimension, count]) => ({
      dimension,
      count,
      pct: Math.round((count / conCausa.length) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Predicción a nivel equipo: médicos con bienestar en descenso (riesgo en alza).
  const enAlza = medicoRows.filter(
    (m) => m.latest_analysis && m.history.length >= 3 && pendiente(m.history) < -1,
  ).length;

  return (
    <div className="px-5 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <UsersIcon className="h-5 w-5" style={{ color: "var(--color-primary)" } as React.CSSProperties} />
            <span className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
              {clinicName}
            </span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
            Estado del equipo
          </h1>
        </div>
        <form action={signOutAnalista}>
          <button type="submit" className="p-2 rounded-xl"
                  style={{ color: "var(--color-text-subtle)" }} aria-label="Cerrar sesión">
            <SignOutIcon className="h-5 w-5" />
          </button>
        </form>
      </div>

      {/* Código de clínica */}
      <div className="card mb-5 flex items-center justify-between"
           style={{ borderColor: "var(--color-primary-soft)", background: "var(--color-primary-lt)" }}>
        <div>
          <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
            Código de invitación
          </p>
          <p className="text-lg font-bold font-mono tracking-widest"
             style={{ color: "var(--color-primary)" }}>
            {clinicCode}
          </p>
        </div>
        <p className="text-xs text-right" style={{ color: "var(--color-text-subtle)" }}>
          Comparte este código<br />con tus médicos
        </p>
      </div>

      {/* Resumen riesgo */}
      {medicoRows.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <SummaryPill label="Sin datos" value={noData} bg="var(--color-bg)" color="var(--color-text-subtle)" />
          <SummaryPill label="Riesgo medio" value={midRisk} bg="var(--color-risk-mid-bg)" color="var(--color-risk-mid)" />
          <SummaryPill label="Riesgo alto" value={highRisk} bg="var(--color-risk-high-bg)" color="var(--color-risk-high)" />
        </div>
      )}

      {/* Predicción: médicos en alza */}
      {enAlza > 0 && (
        <div className="card mb-5 flex items-center gap-3"
             style={{ borderColor: "var(--color-risk-mid)", background: "var(--color-risk-mid-bg)" }}>
          <AlertIcon className="h-5 w-5 flex-shrink-0" style={{ color: "var(--color-risk-mid)" }} />
          <p className="text-sm" style={{ color: "var(--color-risk-mid)" }}>
            <strong>{enAlza}</strong> médico{enAlza === 1 ? "" : "s"} con bienestar en descenso esta semana, conviene anticiparse.
          </p>
        </div>
      )}

      {/* Por qué sube el equipo - ranking de causas */}
      {causasRanking.length > 0 && (
        <div className="card mb-5">
          <p className="text-xs font-bold uppercase tracking-widest mb-1"
             style={{ color: "var(--color-text-subtle)" }}>
            Por qué sube el equipo
          </p>
          <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>
            Causa principal según el último check-in de cada médico.
          </p>
          <div className="space-y-3">
            {causasRanking.map(({ dimension, count, pct }) => {
              const info = CAUSAS[dimension];
              if (!info) return null;
              const Icon = info.Icon;
              return (
                <div key={dimension}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 flex-shrink-0" style={{ color: "var(--color-primary)" }} />
                    <span className="text-sm flex-1" style={{ color: "var(--color-text)" }}>{info.label}</span>
                    <span className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>
                      {count} {count === 1 ? "médico" : "médicos"} · {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
                    <div className="h-full rounded-full"
                         style={{ width: `${pct}%`, background: "var(--color-primary)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de médicos */}
      {medicoRows.length === 0 ? (
        <div className="card text-center py-10">
          <UsersIcon className="h-8 w-8 mx-auto mb-2" style={{ color: "var(--color-text-subtle)" } as React.CSSProperties} />
          <p className="font-medium mb-1" style={{ color: "var(--color-text)" }}>
            No hay médicos registrados
          </p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Comparte el código{" "}
            <span className="font-mono font-bold">{clinicCode}</span>{" "}
            para que los médicos se registren.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {medicoRows
            .sort((a, b) => {
              const order = { alto: 0, medio: 1, bajo: 2 };
              const aR = a.latest_analysis?.nivel_riesgo ?? "bajo";
              const bR = b.latest_analysis?.nivel_riesgo ?? "bajo";
              return order[aR] - order[bR];
            })
            .map((m) => (
              <div key={m.id} className="card">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                       style={{ background: "var(--color-primary)" }}>
                    {(m.full_name ?? "?").split(" ").filter((_,i) => i<2).map((n) => n[0]).join("")}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                          {m.full_name ?? "-"}
                        </p>
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                          {m.specialty ?? "Sin especialidad"}
                        </p>
                      </div>
                      {m.latest_analysis ? (
                        <RiskChip nivel={m.latest_analysis.nivel_riesgo} />
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full"
                              style={{ background: "var(--color-bg)", color: "var(--color-text-subtle)" }}>
                          Sin check-in
                        </span>
                      )}
                    </div>

                    {m.latest_analysis && (
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <span className="text-xs" style={{ color: "var(--color-text-subtle)" }}>
                            Bienestar:{" "}
                          </span>
                          <span className="text-sm font-bold" style={{ color: "var(--color-primary)" }}>
                            {m.latest_analysis.indice_pulso}/100
                          </span>
                        </div>
                        {m.history.length >= 2 && (
                          <SparkLine
                            values={m.history}
                            color={
                              m.latest_analysis.nivel_riesgo === "alto" ? "var(--color-risk-high)" :
                              m.latest_analysis.nivel_riesgo === "medio" ? "var(--color-risk-mid)" :
                              "var(--color-risk-low)"
                            }
                          />
                        )}
                      </div>
                    )}

                    {m.latest_analysis && (
                      <p className="text-xs mt-1" style={{ color: "var(--color-text-subtle)" }}>
                        Último check-in: {new Date(m.latest_analysis.fecha + "T12:00:00").toLocaleDateString("es-AR")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function SummaryPill({
  label, value, bg, color,
}: { label: string; value: number; bg: string; color: string }) {
  return (
    <div className="rounded-2xl p-3 text-center" style={{ background: bg }}>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs font-medium mt-0.5" style={{ color }}>{label}</p>
    </div>
  );
}
