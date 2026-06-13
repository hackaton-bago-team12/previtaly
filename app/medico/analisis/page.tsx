import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckinClient } from "../CheckinClient";

export default async function AnalisisPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <CheckinClient />;
}
