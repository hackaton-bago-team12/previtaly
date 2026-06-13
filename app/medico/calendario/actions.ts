"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AppointmentState = { error?: string };

export async function addAppointment(
  _prev: AppointmentState,
  formData: FormData,
): Promise<AppointmentState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const titulo      = String(formData.get("titulo") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const paciente    = String(formData.get("paciente") ?? "").trim();
  const tipo        = String(formData.get("tipo") ?? "consulta");
  const fecha       = String(formData.get("fecha") ?? "");
  const horaInicio  = String(formData.get("horaInicio") ?? "08:00");
  const horaFin     = String(formData.get("horaFin") ?? "09:00");

  if (!titulo || !fecha) return { error: "Título y fecha son requeridos." };

  const { error } = await supabase.from("appointments").insert({
    medico_id:    user.id,
    titulo,
    descripcion:  descripcion || null,
    paciente:     paciente || null,
    tipo,
    fecha_inicio: `${fecha}T${horaInicio}:00`,
    fecha_fin:    `${fecha}T${horaFin}:00`,
  });

  if (error) return { error: "No se pudo agregar el turno." };
  revalidatePath("/medico/calendario");
  return {};
}

export async function deleteAppointment(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("appointments").delete().eq("id", id).eq("medico_id", user.id);
  revalidatePath("/medico/calendario");
}
