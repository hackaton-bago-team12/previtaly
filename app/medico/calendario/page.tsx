import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CalendarioClient } from "./CalendarioClient";

export default async function CalendarioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  // Turnos del médico para hoy (desde Supabase)
  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("medico_id", user.id)
    .gte("fecha_inicio", today + "T00:00:00")
    .lte("fecha_inicio", today + "T23:59:59")
    .order("fecha_inicio");

  return (
    <CalendarioClient
      appointments={appointments ?? []}
      today={today}
      medicoId={user.id}
    />
  );
}
