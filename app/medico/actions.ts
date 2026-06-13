"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateMockAnalysis } from "@/lib/mock-analysis";

export type CheckinState = { error?: string };

export async function submitCheckin(
  _prev: CheckinState,
  formData: FormData,
): Promise<CheckinState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const transcripcion = String(formData.get("transcripcion") ?? "").trim();
  const comidas       = Number(formData.get("comidas") ?? 0);
  const energia       = Number(formData.get("energia") ?? 5);
  const actividad     = Number(formData.get("actividad") ?? 5);

  // Insertar check-in
  const { data: checkin, error: checkinErr } = await supabase
    .from("daily_checkins")
    .insert({
      medico_id:        user.id,
      transcripcion_voz: transcripcion || null,
      comidas:          comidas || null,
      energia,
      actividad_fisica: actividad,
    })
    .select()
    .single();

  if (checkinErr || !checkin) {
    return { error: "No se pudo guardar el check-in." };
  }

  // Generar análisis mock (reemplazable por IA real)
  const analysis = generateMockAnalysis({ transcripcion, comidas, energia, actividad });

  await supabase.from("ai_analysis").insert({
    checkin_id:         checkin.id,
    medico_id:          user.id,
    fecha:              new Date().toISOString().split("T")[0],
    indice_pulso:       analysis.indicePulso,
    concentracion:      analysis.concentracion,
    estres:             analysis.estres,
    capacidad_restante: analysis.capacidadRestante,
    carga_acumulada:    analysis.cargaAcumulada,
    nivel_riesgo:       analysis.nivelRiesgo,
    detectados:         analysis.detectados,
    sugerencias:        analysis.sugerencias,
    tendencia:          analysis.tendencia,
  });

  revalidatePath("/medico/resultados");
  redirect("/medico/resultados");
}

export async function signOutMedico() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
