import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { LightbulbIcon } from "@/components/ui/icons";

type Sugerencia = {
  tipo: "primaria" | "secundaria";
  titulo: string;
  descripcion: string;
  icono: string;
};

export default async function SugerenciasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Última análisis para las sugerencias
  const { data: latest } = await supabase
    .from("ai_analysis")
    .select("sugerencias, nivel_riesgo, fecha")
    .eq("medico_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sugerencias = (latest?.sugerencias as Sugerencia[] | null) ?? [];
  const primaria    = sugerencias.find((s) => s.tipo === "primaria");
  const secundarias = sugerencias.filter((s) => s.tipo === "secundaria");

  // Sugerencias de bienestar general (siempre disponibles)
  const generales = [
    {
      titulo: "Respiración 4-7-8",
      descripcion: "Inhalá 4 segundos, retené 7, exhalá 8. Repite 4 veces. Activa el sistema nervioso parasimpático.",
      icono: "🌬️",
    },
    {
      titulo: "Caminata de 10 minutos",
      descripcion: "Salir a caminar entre consultas reduce el cortisol y mejora la claridad mental.",
      icono: "🚶",
    },
    {
      titulo: "Hidratación consciente",
      descripcion: "Un vaso de agua cada hora de guardia. La deshidratación leve afecta la concentración un 15%.",
      icono: "💧",
    },
  ];

  return (
    <div className="px-5 py-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <LightbulbIcon className="h-5 w-5" style={{ color: "var(--color-primary)" } as React.CSSProperties} />
        <span className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
          Tu plan de hoy
        </span>
      </div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--color-text)" }}>
        Para cuidar tu rendimiento
      </h1>

      {!latest ? (
        <div className="card text-center py-10 mb-5">
          <p className="text-3xl mb-3">💡</p>
          <p className="font-semibold mb-1" style={{ color: "var(--color-text)" }}>
            Hacé tu primer check-in
          </p>
          <p className="text-sm mb-5" style={{ color: "var(--color-text-muted)" }}>
            Las sugerencias personalizadas se generan después de tu análisis diario.
          </p>
          <Link href="/medico" className="btn-primary inline-block w-auto px-6">
            Empezar check-in →
          </Link>
        </div>
      ) : (
        <>
          {/* Sugerencias IA personalizadas */}
          {sugerencias.length > 0 && (
            <div className="space-y-3 mb-6">
              {/* Acción primaria — tarjeta destacada */}
              {primaria && (
                <div className="rounded-2xl p-5 text-white"
                     style={{ background: "var(--color-primary)" }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                         style={{ background: "rgba(255,255,255,0.15)" }}>
                      {primaria.icono}
                    </div>
                    <div>
                      <p className="font-semibold leading-tight">{primaria.titulo}</p>
                      <p className="text-sm mt-1 opacity-85">{primaria.descripcion}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Acciones secundarias */}
              {secundarias.map((s, i) => (
                <div key={i} className="card flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                       style={{ background: "var(--color-primary-lt)" }}>
                    {s.icono}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                      {s.titulo}
                    </p>
                    <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      {s.descripcion}
                    </p>
                  </div>
                </div>
              ))}

              <p className="text-xs text-center" style={{ color: "var(--color-text-subtle)" }}>
                + Generado por IA según tu carga y tu estado
              </p>
            </div>
          )}
        </>
      )}

      {/* Sugerencias de bienestar — siempre visibles */}
      <div className="mb-2">
        <h2 className="text-sm font-bold mb-3 uppercase tracking-wider"
            style={{ color: "var(--color-text-subtle)" }}>
          Técnicas de bienestar
        </h2>
        <div className="space-y-3">
          {generales.map((g, i) => (
            <div key={i} className="card flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                   style={{ background: "var(--color-primary-lt)" }}>
                {g.icono}
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                  {g.titulo}
                </p>
                <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                  {g.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Acción de mayor impacto */}
      {latest?.nivel_riesgo === "alto" && (
        <div className="mt-5 rounded-2xl p-5 border-2"
             style={{ borderColor: "var(--color-risk-high)", background: "var(--color-risk-high-bg)" }}>
          <p className="font-bold mb-1" style={{ color: "var(--color-risk-high)" }}>
            🔴 Evaluación recomendada
          </p>
          <p className="text-sm mb-3" style={{ color: "#7f1d1d" }}>
            Tu analista puede agendar una sesión con el equipo de salud mental de tu clínica.
            No es una señal de debilidad — es parte del protocolo de cuidado.
          </p>
          <p className="text-xs" style={{ color: "#7f1d1d", opacity: 0.8 }}>
            Tu analista ha sido notificado de tu estado actual.
          </p>
        </div>
      )}

      {latest && (
        <Link href="/medico"
              className="block text-center text-sm underline underline-offset-2 mt-6"
              style={{ color: "var(--color-text-subtle)" }}>
          Listo
        </Link>
      )}
    </div>
  );
}
