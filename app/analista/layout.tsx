import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/ui/BottomNav";
import { signOutAnalista } from "./actions";

export default async function AnalistaLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--color-bg)" }}>
      <main className="flex-1 safe-pb max-w-2xl mx-auto w-full">
        {children}
      </main>
      <BottomNav role="analista" signOutAction={signOutAnalista} />
    </div>
  );
}
