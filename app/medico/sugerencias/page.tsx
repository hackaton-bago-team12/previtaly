import { redirect } from "next/navigation";

// Los consejos y sugerencias ahora están integrados en la pantalla de resultados.
export default function SugerenciasRedirect() {
  redirect("/medico/resultados");
}
