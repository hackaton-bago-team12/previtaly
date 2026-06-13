"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOutAnalista() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function assignShift(shiftId: string, medicoId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  // Verificar si el médico tiene riesgo alto o capacidad baja
  const { data: analysis } = await supabase
    .from("ai_analysis")
    .select("nivel_riesgo, capacidad_restante")
    .eq("medico_id", medicoId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (analysis) {
    const bloqueado =
      analysis.nivel_riesgo === "alto" ||
      (analysis.capacidad_restante !== null && analysis.capacidad_restante < 30);

    if (bloqueado) {
      const motivo =
        analysis.nivel_riesgo === "alto"
          ? "La IA detectó carga mental elevada en este médico. No se recomienda asignarle guardias extra."
          : "La IA detectó que este médico tiene menos del 30% de capacidad restante.";

      return { error: motivo };
    }
  }

  const { error } = await supabase
    .from("extra_shifts")
    .update({ medico_asignado_id: medicoId, bloqueado: false, motivo_bloqueo: null })
    .eq("id", shiftId);

  if (error) return { error: "No se pudo asignar la guardia." };
  revalidatePath("/analista/calendario");
  return {};
}

export async function unassignShift(shiftId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("extra_shifts")
    .update({ medico_asignado_id: null })
    .eq("id", shiftId);

  if (error) return { error: "No se pudo desasignar la guardia." };
  revalidatePath("/analista/calendario");
  return {};
}

export async function addExtraShift(
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { data: analistaProfile } = await supabase
    .from("profiles")
    .select("clinic_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!analistaProfile?.clinic_id) return { error: "Sin clínica asociada." };

  const titulo     = String(formData.get("titulo") ?? "").trim();
  const fecha      = String(formData.get("fecha") ?? "");
  const horaInicio = String(formData.get("horaInicio") ?? "08:00");
  const horaFin    = String(formData.get("horaFin") ?? "16:00");

  if (!titulo || !fecha) return { error: "Título y fecha son requeridos." };

  const { error } = await supabase.from("extra_shifts").insert({
    clinic_id:    analistaProfile.clinic_id,
    titulo,
    fecha_inicio: `${fecha}T${horaInicio}:00`,
    fecha_fin:    `${fecha}T${horaFin}:00`,
  });

  if (error) return { error: "No se pudo crear la guardia." };
  revalidatePath("/analista/calendario");
  return {};
}
