import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ConsejosCards, SeguimientoBanner, type Sugerencia } from "@/components/medico/ConsejosCards";

export default async function ConsejosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: latest } = await supabase
    .from("ai_analysis")
    .select("sugerencias, nivel_riesgo")
    .eq("medico_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sugerencias = (latest?.sugerencias as Sugerencia[] | null) ?? [];
  const riesgo = latest?.nivel_riesgo as "bajo" | "medio" | "alto" | undefined;
  const mostrarSeguimiento = riesgo === "medio" || riesgo === "alto";

  return (
    <div style={{ padding: "18px 22px 24px", animation: "screenIn .35s ease" }}>
      <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--color-text-subtle)", fontWeight: 600 }}>Basado en tu último análisis</div>
      <h1 style={{ margin: "8px 0 4px", fontSize: 25, fontWeight: 700, letterSpacing: "-.02em", color: "var(--color-text)" }}>Tu plan de hoy</h1>
      <p style={{ margin: "0 0 20px", fontSize: 14.5, color: "var(--color-text-muted)", lineHeight: 1.45 }}>Pequeños pasos que mueven tu Índice de Pulso.</p>

      {!latest ? (
        <div className="card text-center" style={{ paddingTop: 36, paddingBottom: 36 }}>
          <p className="font-semibold" style={{ color: "var(--color-text)", marginBottom: 4 }}>Todavía no hay consejos</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)", marginBottom: 18 }}>
            Haz tu Análisis o Consejería del día para recibir tu plan personalizado.
          </p>
          <Link href="/medico" className="btn-primary inline-block w-auto" style={{ paddingLeft: 24, paddingRight: 24 }}>Ir al inicio →</Link>
        </div>
      ) : (
        <>
          <ConsejosCards sugerencias={sugerencias} />
          {mostrarSeguimiento && <SeguimientoBanner />}
          <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--color-text-subtle)", fontStyle: "italic", textAlign: "center" }}>
            Generado por IA según tu estado y carga
          </div>
        </>
      )}
    </div>
  );
}
