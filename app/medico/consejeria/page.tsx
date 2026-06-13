import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConsejeriaClient } from "./ConsejeriaClient";

export default async function ConsejeriaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <ConsejeriaClient />;
}
