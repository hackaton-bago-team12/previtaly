"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { analyzeCheckin } from "@/lib/ai-service";

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
  const modo          = formData.get("modo") === "express" ? "express" : "completo";

  // Insertar check-in
  const { data: checkin, error: checkinErr } = await supabase
    .from("daily_checkins")
    .insert({
      medico_id:        user.id,
      transcripcion_voz: transcripcion || null,
      comidas:          comidas || null,
      energia,
      actividad_fisica: actividad,
      modo,
    })
    .select()
    .single();

  if (checkinErr || !checkin) {
    return { error: "No se pudo guardar el check-in." };
  }

  // Análisis con IA real (Azure OpenAI vía nuestro microservicio).
  // Si el servicio no está disponible, cae automaticamente al mock.
  const analysis = await analyzeCheckin({ transcripcion, comidas, energia, actividad });

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
    causa_principal:    analysis.causaPrincipal,
    factores:           analysis.factores,
  });

  revalidatePath("/medico/resultados");
  redirect("/medico/resultados");
}

export type Sugerencia = { tipo: "primaria" | "secundaria"; titulo: string; descripcion: string; icono: string };
export type ConsejeriaState = {
  ok?: boolean;
  sugerencias?: Sugerencia[];
  fecha?: string;
  nivelRiesgo?: "bajo" | "medio" | "alto";
  error?: string;
};

export async function submitConsejeria(
  _prev: ConsejeriaState,
  formData: FormData,
): Promise<ConsejeriaState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const transcripcion = String(formData.get("transcripcion") ?? "").trim();

  // Reutilizamos el motor de análisis: nos da las sugerencias del día.
  const analysis = await analyzeCheckin({ transcripcion, comidas: 2, energia: 6, actividad: 5 });
  const fecha = new Date().toISOString().split("T")[0];

  const { error } = await supabase.from("ai_analysis").insert({
    medico_id:          user.id,
    fecha,
    tipo:               "consejeria",
    indice_pulso:       analysis.indicePulso,
    concentracion:      analysis.concentracion,
    estres:             analysis.estres,
    capacidad_restante: analysis.capacidadRestante,
    carga_acumulada:    analysis.cargaAcumulada,
    nivel_riesgo:       analysis.nivelRiesgo,
    detectados:         analysis.detectados,
    sugerencias:        analysis.sugerencias,
    tendencia:          analysis.tendencia,
    causa_principal:    analysis.causaPrincipal,
    factores:           analysis.factores,
  });

  if (error) {
    // Caso típico: falta la columna `tipo` (migración no aplicada todavía).
    if (/tipo/i.test(error.message) || error.code === "PGRST204" || error.code === "42703") {
      return { error: "Falta aplicar la migración de la columna 'tipo' en Supabase (ver README)." };
    }
    return { error: "No se pudo guardar la consejería." };
  }

  revalidatePath("/medico/historial");
  return { ok: true, sugerencias: analysis.sugerencias as Sugerencia[], fecha, nivelRiesgo: analysis.nivelRiesgo };
}

export async function signOutMedico() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
