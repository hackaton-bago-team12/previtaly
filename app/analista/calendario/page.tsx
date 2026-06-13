import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CalendarioAnalistaClient } from "./CalendarioAnalistaClient";

export default async function CalendarioAnalistaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: analistaProfile } = await supabase
    .from("profiles")
    .select("clinic_id")
    .eq("id", user.id)
    .maybeSingle();

  const clinicId = analistaProfile?.clinic_id;

  // Médicos de la clínica
  const { data: medicos } = await supabase
    .from("profiles")
    .select("id, full_name, specialty")
    .eq("clinic_id", clinicId)
    .eq("role", "medico");

  const medicoIds = (medicos ?? []).map((m) => m.id);

  // Turnos de todos los médicos (hoy en adelante)
  const today = new Date().toISOString().split("T")[0];
  const { data: appointments } = medicoIds.length
    ? await supabase
        .from("appointments")
        .select("*")
        .in("medico_id", medicoIds)
        .gte("fecha_inicio", today + "T00:00:00")
        .order("fecha_inicio")
    : { data: [] };

  // Guardias extra de la clínica
  const { data: extraShifts } = await supabase
    .from("extra_shifts")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("fecha_inicio");

  // Estado de riesgo de cada médico
  const riskMap: Record<string, { nivel: string; capacidad: number | null }> = {};
  for (const m of medicos ?? []) {
    const { data: an } = await supabase
      .from("ai_analysis")
      .select("nivel_riesgo, capacidad_restante")
      .eq("medico_id", m.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (an) riskMap[m.id] = { nivel: an.nivel_riesgo, capacidad: an.capacidad_restante };
  }

  return (
    <CalendarioAnalistaClient
      medicos={medicos ?? []}
      appointments={appointments ?? []}
      extraShifts={extraShifts ?? []}
      riskMap={riskMap}
      today={today}
    />
  );
}
