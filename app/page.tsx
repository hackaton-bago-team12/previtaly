import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";
import { Landing } from "@/components/landing/Landing";

export default async function Home() {
  // Si hay sesión activa, el usuario va directo a su panel.
  if (hasEnvVars) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, clinic_id")
        .eq("id", user.id)
        .maybeSingle();

      // Usuario de Google sin clínica asignada → completar perfil
      if (!profile?.clinic_id) {
        redirect("/completar-perfil");
      }

      const role = profile?.role ?? "medico";
      redirect(role === "analista" ? "/analista" : "/medico");
    }
  }

  // Visitante sin sesión → landing pública.
  return <Landing />;
}
