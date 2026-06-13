"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CompletarPerfilState = { error?: string };

export async function completarPerfil(
  _prev: CompletarPerfilState,
  formData: FormData,
): Promise<CompletarPerfilState> {
  const clinicCode = String(formData.get("clinicCode") ?? "").trim().toUpperCase();

  if (!clinicCode) return { error: "Ingresa el código de clínica." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Buscar la clínica por código (RPC bypasea RLS)
  const { data: clinicId } = await supabase.rpc("get_clinic_by_code", { p_code: clinicCode });

  if (!clinicId) return { error: "Código de clínica inválido. Pídelo a tu analista." };

  // Actualizar el perfil con la clínica (el trigger ya creó el registro)
  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ clinic_id: clinicId, role: "medico" })
    .eq("id", user.id);

  if (updateErr) return { error: "No se pudo actualizar tu perfil. Intenta de nuevo." };

  redirect("/medico");
}
