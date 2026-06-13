"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateClinicCode } from "@/lib/clinic-code";
import { hasEnvVars } from "@/lib/utils";

export type SignupState = { error?: string; clinicCode?: string };

/* ── Registro de analista ─────────────────────────────────────────── */
export async function signupAnalista(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  if (!hasEnvVars) return { error: "Falta configurar Supabase en .env.local" };

  const email      = String(formData.get("email") ?? "").trim();
  const password   = String(formData.get("password") ?? "");
  const fullName   = String(formData.get("fullName") ?? "").trim();
  const clinicName = String(formData.get("clinicName") ?? "").trim();

  if (!email || !password || !fullName || !clinicName)
    return { error: "Completá todos los campos." };
  if (password.length < 6)
    return { error: "La contraseña debe tener al menos 6 caracteres." };

  const supabase = await createClient();

  // Crear clínica via función security definer (bypasea RLS)
  const code = generateClinicCode();
  const { data: clinicId, error: clinicErr } = await supabase
    .rpc("create_clinic", { p_name: clinicName, p_code: code });

  if (clinicErr || !clinicId) {
    console.error("[signupAnalista] clinicErr:", clinicErr?.message);
    return { error: "No se pudo crear la clínica. Verificá que el schema de Supabase esté aplicado." };
  }
  const clinic = { id: clinicId as string };

  // Registrar usuario con metadata
  const { error: authErr } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "analista",
        clinic_id: clinic.id,
      },
    },
  });

  if (authErr) {
    return { error: traducirError(authErr.message) };
  }

  return { clinicCode: code };
}

/* ── Registro de médico ───────────────────────────────────────────── */
export async function signupMedico(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  if (!hasEnvVars) return { error: "Falta configurar Supabase en .env.local" };

  const email      = String(formData.get("email") ?? "").trim();
  const password   = String(formData.get("password") ?? "");
  const fullName   = String(formData.get("fullName") ?? "").trim();
  const specialty  = "Medicina General";
  const clinicCode = String(formData.get("clinicCode") ?? "").trim().toUpperCase();

  if (!email || !password || !fullName || !clinicCode)
    return { error: "Completá todos los campos." };
  if (password.length < 6)
    return { error: "La contraseña debe tener al menos 6 caracteres." };

  const supabase = await createClient();

  // Verificar código de clínica via RPC (security definer bypasea RLS,
  // ya que el médico aún no tiene perfil vinculado a ninguna clínica).
  const { data: clinicId } = await supabase
    .rpc("get_clinic_by_code", { p_code: clinicCode });

  if (!clinicId)
    return { error: "Código de clínica inválido. Pedíselo a tu analista." };

  const clinic = { id: clinicId as string };

  const { error: authErr } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "medico",
        clinic_id: clinic.id,
        specialty,
      },
    },
  });

  if (authErr) return { error: traducirError(authErr.message) };

  redirect("/login?registered=1");
}

function traducirError(message: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials":  "Email o contraseña incorrectos.",
    "Email not confirmed":        "Todavía no confirmaste tu email.",
    "User already registered":    "Ya existe una cuenta con ese email.",
  };
  return map[message] ?? message;
}
