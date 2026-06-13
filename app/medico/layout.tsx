import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/ui/BottomNav";
import { SettingsSheet } from "@/components/ui/SettingsSheet";
import { signOutMedico } from "./actions";

export default async function MedicoLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, specialty, clinics(name)")
    .eq("id", user.id)
    .maybeSingle();

  const fullName = profile?.full_name || "Doctor";
  const especialidad = profile?.specialty || "Médico";
  const clinica = (profile?.clinics as { name?: string } | null)?.name;
  const subtitle = [especialidad, clinica && `Clínica ${clinica}`].filter(Boolean).join(" · ");
  const initial = fullName.replace(/^Dr[a]?\.?\s*/i, "").charAt(0).toUpperCase() || "M";

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--color-bg)" }}>
      <main className="flex-1 safe-pb max-w-md mx-auto w-full relative">
        {children}
      </main>
      <SettingsSheet
        role="medico"
        name={fullName}
        subtitle={subtitle || "Médico"}
        initial={initial}
        signOutAction={signOutMedico}
      />
      <BottomNav role="medico" />
    </div>
  );
}
