"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";

export type AuthState = { error?: string; message?: string };

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!hasEnvVars) {
    return { error: "Falta configurar Supabase en .env.local" };
  }

  const email    = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Completá email y contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: traducirError(error.message) };
  }

  // Leer el rol del perfil para redirigir correctamente
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    revalidatePath("/", "layout");
    const role = profile?.role ?? "medico";
    redirect(role === "analista" ? "/analista" : "/medico");
  }

  revalidatePath("/", "layout");
  redirect("/medico");
}

function traducirError(message: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "Email o contraseña incorrectos.",
    "Email not confirmed":       "Todavía no confirmaste tu email.",
    "User already registered":   "Ya existe una cuenta con ese email.",
  };
  return map[message] ?? message;
}
