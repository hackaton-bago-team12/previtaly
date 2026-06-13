import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AnalisisResult, type AnalisisRow } from "@/components/medico/AnalisisResult";
import { BackButton } from "@/components/ui/BackButton";

export default async function ResultadosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Último análisis (tipo análisis; si la columna no existe aún, trae el último).
  const { data: latest } = await supabase
    .from("ai_analysis")
    .select("fecha, indice_pulso, capacidad_restante, nivel_riesgo, tendencia, causa_principal, detectados")
    .eq("medico_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latest) {
    return (
      <div style={{ padding: "74px 22px 30px", animation: "screenIn .35s ease" }}>
        <BackButton href="/medico" />
        <div className="card text-center" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <p className="font-semibold" style={{ color: "var(--color-text)", marginBottom: 4 }}>Todavía no tenés análisis</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)", marginBottom: 20 }}>
            Hacé tu Análisis del Día para ver tu Índice de Pulso.
          </p>
          <Link href="/medico/analisis" className="btn-primary inline-block w-auto" style={{ paddingLeft: 24, paddingRight: 24 }}>
            Empezar análisis →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AnalisisResult
      analysis={latest as AnalisisRow}
      backHref="/medico"
      ctaHref="/medico"
      ctaLabel="Listo"
    />
  );
}
