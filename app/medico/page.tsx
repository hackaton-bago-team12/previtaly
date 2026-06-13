import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckinClient } from "./CheckinClient";

export default async function MedicoHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, specialty")
    .eq("id", user.id)
    .maybeSingle();

  const firstName = profile?.full_name?.split(" ")[0] ?? "Doctor";

  return <CheckinClient nombre={firstName} />;
}
