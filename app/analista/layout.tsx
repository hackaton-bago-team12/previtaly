import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/ui/BottomNav";
import { SettingsSheet } from "@/components/ui/SettingsSheet";
import { signOutAnalista } from "./actions";

export default async function AnalistaLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, clinics(name)")
    .eq("id", user.id)
    .maybeSingle();

  const fullName = profile?.full_name || "Analista";
  const clinica = (profile?.clinics as { name?: string } | null)?.name;
  const subtitle = clinica ? `Clínica ${clinica}` : "Analista de clínica";
  const initial = fullName.charAt(0).toUpperCase() || "A";

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--color-bg)" }}>
      <main className="flex-1 safe-pb max-w-2xl mx-auto w-full relative">
        {children}
      </main>
      <SettingsSheet
        role="analista"
        name={fullName}
        subtitle={subtitle}
        initial={initial}
        signOutAction={signOutAnalista}
        widthClass="max-w-2xl"
      />
      <BottomNav role="analista" widthClass="max-w-2xl" />
    </div>
  );
}
