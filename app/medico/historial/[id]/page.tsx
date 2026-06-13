import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnalisisResult, type AnalisisRow } from "@/components/medico/AnalisisResult";
import { ConsejeriaResult } from "@/components/medico/ConsejeriaResult";
import type { Sugerencia } from "@/components/medico/ConsejosCards";

export default async function HistorialDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: row } = await supabase
    .from("ai_analysis")
    .select("*")
    .eq("id", id)
    .eq("medico_id", user.id)
    .maybeSingle();

  if (!row) notFound();

  const tipo = row.tipo === "consejeria" ? "consejeria" : "analisis";

  if (tipo === "consejeria") {
    return (
      <ConsejeriaResult
        fecha={row.fecha}
        sugerencias={(row.sugerencias as Sugerencia[]) ?? []}
        nivelRiesgo={row.nivel_riesgo}
        backHref="/medico/historial"
        ctaHref="/medico/historial"
        ctaLabel="Volver al historial"
      />
    );
  }

  return (
    <AnalisisResult
      analysis={row as AnalisisRow}
      backHref="/medico/historial"
      ctaHref="/medico/historial"
      ctaLabel="Volver al historial"
    />
  );
}
